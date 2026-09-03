import { EventEmitter } from "node:events";
import { DEFAULT_COMMANDS } from "../config/defaultCommands.js";
import {
  ENGINE_PROFILE,
  inferReplyExpectation,
  pickIdlePresencePrompt,
  pickSilenceFollowUp,
  pickStartupGreeting
} from "../config/engineProfile.js";
import { routeCommand } from "../services/automation/commandRouter.js";
import {
  findAndOpenVideoByName,
  openKnownFolder,
  openChromeSearch,
  openInternalStorage,
  openUrl,
  scrollActiveWindow
} from "../services/automation/browserActions.js";
import {
  lockComputer,
  restartComputer,
  shutdownComputer
} from "../services/automation/systemActions.js";
import {
  answerPersonalFactQuestion,
  extractPersonalFacts
} from "../services/learning/personalFacts.js";
import { generateLocalOfflineReply } from "../services/llm/localOfflineResponder.js";
import { ManualResponseStore } from "../services/manual/manualResponseStore.js";
import { buildSystemPrompt } from "./promptBuilder.js";

export class AuraEngine extends EventEmitter {
  constructor({
    config,
    database,
    behaviorTracker,
    performanceReporter,
    openAIClient,
    ollamaClient,
    cloudSync
  }) {
    super();
    this.config = config;
    this.database = database;
    this.behaviorTracker = behaviorTracker;
    this.performanceReporter = performanceReporter;
    this.openAIClient = openAIClient;
    this.ollamaClient = ollamaClient;
    this.cloudSync = cloudSync;
    this.manualResponseStore = new ManualResponseStore(
      config.storage.manualResponsesPath,
      () => ({
        assistantName: this.config.assistantName,
        ownerName: this.config.ownerName,
        addressUserAs: this.config.persona.addressUserAs
      })
    );
    this.state = {
      listening: config.modes.alwaysListen,
      onlinePreferred: config.modes.preferOnlineForChat,
      inputLanguage: config.modes.defaultInputLanguage,
      replyLanguage: config.modes.defaultReplyLanguage,
      lastUserText: "",
      lastAssistantText: "",
      lastLatencyMs: 0,
      lastProvider: "none",
      speaking: false,
      awaitingReply: false,
      bootedAt: new Date().toISOString()
    };
  }

  getPublicState() {
    return {
      assistantName: this.config.assistantName,
      ownerName: this.config.ownerName,
      state: structuredClone(this.state),
      preferences: this.database.getPreferences(),
      learning: this.behaviorTracker.getSummary(),
      voiceProfiles: this.database.getVoiceProfiles(),
      performance: this.performanceReporter.getSummary(),
      assistantSettings: {
        modes: {
          alwaysListen: this.config.modes.alwaysListen,
          autoStartListeningOnLoad: this.config.modes.autoStartListeningOnLoad,
          startupGreetingEnabled: this.config.modes.startupGreetingEnabled,
          startupGreetingText: this.config.modes.startupGreetingText,
          proactiveFollowUpMs: this.config.modes.proactiveFollowUpMs,
          ownerOnlyTransparency: this.config.modes.ownerOnlyTransparency,
          idlePresenceEnabled: this.config.modes.idlePresenceEnabled,
          idlePresenceMs: this.config.modes.idlePresenceMs
        },
        voices: {
          mode: this.config.voices.mode,
          rate: this.config.voices.rate,
          pitch: this.config.voices.pitch,
          volume: this.config.voices.volume,
          preferredVoiceNames: this.config.voices.preferredVoiceNames,
          customTtsEnabled: this.config.voices.customTts.enabled
        },
        persona: {
          addressUserAs: this.config.persona.addressUserAs
        }
      }
    };
  }

  updateState(patch) {
    this.state = {
      ...this.state,
      ...patch
    };
    this.emit("state", this.getPublicState());
  }

  updatePreferences(patch) {
    const preferences = this.database.updatePreferences(patch);
    this.updateState({
      inputLanguage: preferences.inputLanguage,
      replyLanguage: preferences.replyLanguage,
      listening: preferences.alwaysListen
    });
    return preferences;
  }

  updateRuntime(patch) {
    this.updateState(patch);
    return this.getPublicState();
  }

  async processUserText({ text, source = "voice", ownerVerified = false }) {
    const startedAt = Date.now();
    const trimmedText = text.trim();
    this.behaviorTracker.captureVoiceEvent({
      text: trimmedText,
      language: this.state.inputLanguage,
      source
    });
    this.behaviorTracker.updateProfileFromInteraction({ text: trimmedText });
    this.updateState({ lastUserText: trimmedText });

    const manualResponse = this.manualResponseStore.findMatch(trimmedText);
    if (manualResponse) {
      return this.finalizeLocalReply({
        startedAt,
        userText: trimmedText,
        replyText: manualResponse.replyText,
        provider: "manual-response",
        data: {
          matchedRuleId: manualResponse.id
        }
      });
    }

    const personalMemoryReply = this.handlePersonalMemory(trimmedText);
    if (personalMemoryReply) {
      return this.finalizeLocalReply({
        startedAt,
        userText: trimmedText,
        replyText: personalMemoryReply.replyText,
        provider: personalMemoryReply.provider,
        data: personalMemoryReply.data ?? null
      });
    }

    const command = routeCommand(trimmedText);
    if (command) {
      const result = await this.executeCommand({
        command,
        sourceText: trimmedText,
        ownerVerified
      });

      this.updateState({
        lastAssistantText: result.replyText,
        lastLatencyMs: Date.now() - startedAt,
        lastProvider: "local-command"
      });

      return {
        ok: result.ok,
        replyText: result.replyText,
        action: result.action,
        data: result.data ?? null,
        provider: "local-command",
        conversationState: this.getConversationState(result.replyText, result.action)
      };
    }

    const preferences = this.database.getPreferences();
    const memoryContext = this.database.searchMemories(trimmedText, 6);
    const learningSummary = this.behaviorTracker.getSummary();
    const systemPrompt = buildSystemPrompt({
      config: this.config,
      preferences,
      memoryContext,
      learningSummary
    });
    const conversation = [
      {
        role: "user",
        content: trimmedText
      }
    ];

    let assistantText = "";
    let provider = "offline-fallback";
    let lastModelError = null;

    if (this.state.onlinePreferred && this.openAIClient.enabled) {
      try {
        assistantText = await this.openAIClient.respond({ systemPrompt, conversation });
        provider = "openai";
      } catch (error) {
        assistantText = "";
        lastModelError = `OpenAI failed: ${error.message}`;
      }
    }

    if (!assistantText && this.ollamaClient.enabled) {
      try {
        assistantText = await this.ollamaClient.respond({ systemPrompt, conversation });
        provider = "ollama";
      } catch (error) {
        lastModelError = `Ollama failed: ${error.message}`;
      }
    }

    if (!assistantText) {
      assistantText = generateLocalOfflineReply({
        text: trimmedText,
        config: this.config,
        database: this.database,
        memoryContext
      });
      provider = "local-fallback";
    }

    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureConversation({
      userText: trimmedText,
      assistantText,
      language: preferences.replyLanguage,
      provider,
      latencyMs
    });

    if (this.config.modes.cloudSync) {
      this.cloudSync.pushRecord("conversation", {
        userText: trimmedText,
        assistantText,
        provider,
        language: preferences.replyLanguage,
        lastModelError
      }).catch(() => {});
    }

    this.updateState({
      lastAssistantText: assistantText,
      lastLatencyMs: latencyMs,
      lastProvider: provider
    });

    return {
      ok: true,
      replyText: assistantText,
      provider,
      conversationState: this.getConversationState(assistantText)
    };
  }

  async executeCommand({ command, sourceText, ownerVerified }) {
    if (
      command.requiresDangerousPermission &&
      !this.config.modes.allowDangerousSystemActions
    ) {
      const replyText =
        "Dangerous system actions are disabled in config.local.json. Turn on allowDangerousSystemActions only if you fully trust this setup.";
      this.behaviorTracker.captureCommand({
        text: sourceText,
        actionName: command.intent,
        success: false,
        latencyMs: 0,
        metadata: { blocked: true }
      });
      return {
        ok: false,
        action: command.intent,
        replyText
      };
    }

    if (
      this.config.auth.requireOwnerTokenForRemote &&
      !ownerVerified &&
      command.requiresDangerousPermission
    ) {
      const replyText = "Owner verification is required for this command.";
      this.behaviorTracker.captureCommand({
        text: sourceText,
        actionName: command.intent,
        success: false,
        latencyMs: 0,
        metadata: { blocked: true, reason: "owner-verification-required" }
      });
      return {
        ok: false,
        action: command.intent,
        replyText
      };
    }

    const startedAt = Date.now();
    let replyText = "Done.";
    let actionResult = { ok: true, stdout: "", stderr: "" };
    let action = command.intent;
    let data = null;

    switch (command.intent) {
      case "set-language": {
        const preferences = this.updatePreferences({
          inputLanguage: command.params.languageId,
          replyLanguage: command.params.languageId
        });
        replyText = `Language changed to ${command.params.languageId}.`;
        data = preferences;
        break;
      }
      case "pause-listening": {
        const preferences = this.updatePreferences({
          alwaysListen: false
        });
        replyText = "I paused listening. You can start me again from the dashboard or say resume listening before pausing next time.";
        data = preferences;
        break;
      }
      case "resume-listening": {
        const preferences = this.updatePreferences({
          alwaysListen: true
        });
        replyText = "Always-listening mode is on again. I do not need a wake word.";
        data = preferences;
        break;
      }
      case "open-known-folder":
        actionResult = await openKnownFolder(command.params.folderName);
        replyText = `I opened the ${command.params.folderName} folder, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-video-file":
        actionResult = await findAndOpenVideoByName(command.params.query);
        replyText = `I opened it, ${this.config.persona.addressUserAs}.`;
        data = {
          matchedVideoPath: actionResult.stdout || ""
        };
        break;
      case "add-task": {
        const task = this.database.addTask(command.params.title, sourceText);
        replyText = `I saved the task '${task.title}'. I will keep it in your task list, ${this.config.persona.addressUserAs}.`;
        data = {
          task,
          tasks: this.database.getTasks()
        };
        break;
      }
      case "show-tasks":
        data = {
          tasks: this.database.getTasks()
        };
        replyText = "Showing your assigned tasks in the dashboard.";
        break;
      case "complete-task": {
        const task = this.database.completeTaskByMatcher(command.params.matcher);
        if (task) {
          replyText = `I marked '${task.title}' as completed, ${this.config.persona.addressUserAs}.`;
          data = {
            task,
            tasks: this.database.getTasks()
          };
        } else {
          actionResult = { ok: false, stdout: "", stderr: "Task not found." };
          replyText = "I could not find that task yet.";
        }
        break;
      }
      case "chrome-search":
        actionResult = await openChromeSearch(command.params.query);
        replyText = `I opened Chrome and searched for ${command.params.query}, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-url":
        actionResult = await openUrl(command.params.url);
        replyText = `I opened ${command.params.url}, ${this.config.persona.addressUserAs}.`;
        break;
      case "open-internal-storage":
        actionResult = await openInternalStorage();
        replyText = `I opened your internal storage, ${this.config.persona.addressUserAs}.`;
        break;
      case "scroll-window":
        actionResult = await scrollActiveWindow(
          command.params.direction,
          command.params.steps
        );
        replyText =
          command.params.direction === "up"
            ? `I am scrolling up now, ${this.config.persona.addressUserAs}.`
            : `I am scrolling down now, ${this.config.persona.addressUserAs}.`;
        break;
      case "shutdown-computer":
        actionResult = await shutdownComputer();
        replyText = "Shutting down your computer.";
        break;
      case "restart-computer":
        actionResult = await restartComputer();
        replyText = "Restarting your computer.";
        break;
      case "lock-computer":
        actionResult = await lockComputer();
        replyText = "Locking your computer.";
        break;
      case "show-architecture":
        data = this.getArchitectureReport();
        replyText = "Opening the architecture data in the dashboard.";
        break;
      case "show-memory":
        data = {
          profile: this.database.getProfile(),
          preferences: this.database.getPreferences(),
          recentEvents: this.database.getRecentEvents(20),
          learning: this.behaviorTracker.getSummary(),
          voiceProfiles: this.database.getVoiceProfiles()
        };
        replyText = "Showing your memory and learning data in the dashboard.";
        break;
      case "show-brain":
        data = this.getBrainSnapshot();
        replyText = "Showing your private AURA brain data in the dashboard.";
        break;
      case "show-default-commands":
        data = {
          defaultCommands: DEFAULT_COMMANDS
        };
        replyText = "Showing the default command registry in the dashboard.";
        break;
      case "show-manual-responses":
        data = {
          manualResponses: this.manualResponseStore.getRules()
        };
        replyText = "Showing your manual response rules in the dashboard.";
        break;
      case "show-performance":
        data = this.performanceReporter.getReport();
        replyText = "Showing your performance report in the dashboard.";
        break;
      default:
        replyText = "I understood that as a command, but I do not have an executor for it yet.";
        actionResult = { ok: false, stdout: "", stderr: "Unknown command." };
        break;
    }

    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureCommand({
      text: sourceText,
      actionName: action,
      success: actionResult.ok,
      latencyMs,
      metadata: {
        stderr: actionResult.stderr,
        stdout: actionResult.stdout,
        language: this.state.replyLanguage
      }
    });

    if (actionResult.ok && this.config.modes.cloudSync) {
      this.cloudSync.pushRecord("command", {
        action,
        text: sourceText,
        latencyMs
      }).catch(() => {});
    }

    return {
      ok: actionResult.ok,
      action,
      replyText,
      data,
      latencyMs
    };
  }

  getArchitectureReport() {
    return {
      assistantName: this.config.assistantName,
      backendEntry: "src/index.js",
      apiServer: "src/api/server.js",
      coreBrain: "src/core/auraEngine.js",
      localDatabaseEngine: "src/services/memory/localDatabase.js",
      performanceEngine: "src/services/analytics/performanceReporter.js",
      onlineModel: this.config.models.online,
      offlineModel: this.config.models.offline,
      storage: {
        localDbPath: this.config.storage.localDbPath,
        voiceSamplesDir: this.config.storage.voiceSamplesDir,
        manualResponsesPath: this.config.storage.manualResponsesPath,
        cloud: this.config.storage.cloud,
        collections: [
          "preferences",
          "profile",
          "memories",
          "events",
          "routines",
          "tasks",
          "accessRequests",
          "approvedDevices"
        ]
      },
      engineProfile: {
        name: ENGINE_PROFILE.name,
        version: ENGINE_PROFILE.version,
        mission: ENGINE_PROFILE.mission,
        cognitiveLayers: ENGINE_PROFILE.cognitiveLayers
      },
      neuralLayers: {
        reasoning: this.openAIClient.enabled ? "OpenAI online model" : "Local fallback / Ollama",
        speechToText: "Browser SpeechRecognition by default, optional upgrade to Vosk or Whisper.cpp",
        textToSpeech: this.config.voices.customTts.enabled
          ? "Custom TTS adapter enabled"
          : "Browser SpeechSynthesis voices",
        learning: "Behavior tracking, memory retrieval, routine frequency analysis, and long-term fact storage"
      },
      apiRoutes: {
        talk: "/api/talk",
        memory: "/api/memory",
        performance: "/api/performance",
        voiceProfiles: "/api/voice-profiles",
        brain: "/api/brain",
        proactiveFollowUp: "/api/proactive-follow-up",
        defaultCommands: "/api/default-commands"
      }
    };
  }

  getPerformanceReport() {
    return this.performanceReporter.getReport();
  }

  getBrainSnapshot() {
    const snapshot = this.database.getSnapshot();
    return {
      assistantName: this.config.assistantName,
      ownerName: this.config.ownerName,
      privacy: {
        ownerOnlyTransparency: this.config.modes.ownerOnlyTransparency,
        localDatabasePath: this.config.storage.localDbPath,
        voiceSamplesDir: this.config.storage.voiceSamplesDir,
        manualResponsesPath: this.config.storage.manualResponsesPath
      },
      engineProfile: ENGINE_PROFILE,
      models: {
        online: {
          provider: this.config.models.online.provider,
          baseUrl: this.config.models.online.baseUrl,
          model: this.config.models.online.model,
          enabled: Boolean(this.config.models.online.apiKey)
        },
        offline: {
          provider: this.config.models.offline.provider,
          baseUrl: this.config.models.offline.baseUrl,
          model: this.config.models.offline.model,
          enabled: Boolean(this.config.models.offline.baseUrl)
        }
      },
      preferences: snapshot.preferences,
      profile: snapshot.profile,
      memories: snapshot.memories,
      events: snapshot.events,
      routines: snapshot.routines,
      tasks: snapshot.tasks,
      accessRequests: snapshot.accessRequests,
      approvedDevices: snapshot.approvedDevices.map((device) => ({
        ...device,
        tokenPreview: this.database.previewToken(device.token),
        token: undefined
      })),
      defaultCommands: DEFAULT_COMMANDS,
      manualResponses: this.manualResponseStore.getRules(),
      performance: this.getPerformanceReport()
    };
  }

  createProactiveFollowUp() {
    const replyText = pickSilenceFollowUp(this.state.lastAssistantText);
    this.database.addEvent({
      type: "proactive-follow-up",
      text: replyText,
      success: true,
      metadata: {
        reason: "user-silence",
        language: this.state.replyLanguage
      }
    });
    this.database.addMemory({
      kind: "assistant-follow-up",
      text: `AURA: ${replyText}`,
      language: this.state.replyLanguage,
      tags: ["follow-up", "assistant-initiated"],
      importance: 3
    });
    this.updateState({
      lastAssistantText: replyText,
      lastProvider: "proactive-follow-up",
      awaitingReply: true
    });
    return {
      ok: true,
      replyText,
      provider: "proactive-follow-up",
      conversationState: {
        expectReply: false,
        allowSilenceFollowUp: false,
        followUpDelayMs: this.config.modes.proactiveFollowUpMs
      }
    };
  }

  createPresencePrompt(reason = "idle-help") {
    const replyText =
      reason === "startup-greeting"
        ? `${pickStartupGreeting(this.config).replace(/[.?!]\s*$/, "")}, ${this.config.persona.addressUserAs}.`
        : pickIdlePresencePrompt();

    this.database.addEvent({
      type: "presence-prompt",
      text: replyText,
      success: true,
      metadata: {
        reason,
        language: this.state.replyLanguage
      }
    });

    this.database.addMemory({
      kind: "assistant-presence",
      text: `AURA: ${replyText}`,
      language: this.state.replyLanguage,
      tags: [reason, "assistant-initiated"],
      importance: 2
    });

    this.updateState({
      lastAssistantText: replyText,
      lastProvider: "presence-prompt"
    });

    return {
      ok: true,
      replyText,
      provider: "presence-prompt",
      reason,
      conversationState: {
        expectReply: false,
        allowSilenceFollowUp: false,
        followUpDelayMs: this.config.modes.proactiveFollowUpMs
      }
    };
  }

  getConversationState(replyText, action = "") {
    const expectReply = action.startsWith("show-")
      ? false
      : inferReplyExpectation(replyText);

    this.updateState({
      awaitingReply: expectReply
    });

    return {
      expectReply,
      allowSilenceFollowUp: expectReply,
      followUpDelayMs: this.config.modes.proactiveFollowUpMs
    };
  }

  handlePersonalMemory(text) {
    const profile = this.database.getProfile();
    const answer = answerPersonalFactQuestion(text, profile, this.config.ownerName);
    if (answer) {
      return {
        replyText: answer,
        provider: "profile-memory"
      };
    }

    const facts = extractPersonalFacts(text);
    if (facts.length === 0) {
      return null;
    }

    const storedFacts = facts.map((fact) =>
      this.database.upsertProfileFact(fact.key, fact.value, text)
    );

    for (const storedFact of storedFacts) {
      this.database.addMemory({
        kind: "personal-fact",
        text: `Stored ${storedFact.key}: ${storedFact.value}`,
        language: this.state.replyLanguage,
        tags: ["fact", storedFact.key],
        importance: 10,
        metadata: { sourceText: text }
      });
    }

    const preferredName = this.database.getProfileFact("preferredName")?.value;
    if (preferredName) {
      return {
        replyText: `I will remember that your name is ${preferredName}.`,
        provider: "profile-memory",
        data: {
          facts: storedFacts,
          profile: this.database.getProfile()
        }
      };
    }

    return {
      replyText: "I saved that to your long-term memory.",
      provider: "profile-memory",
      data: {
        facts: storedFacts,
        profile: this.database.getProfile()
      }
    };
  }

  finalizeLocalReply({ startedAt, userText, replyText, provider, data = null }) {
    const latencyMs = Date.now() - startedAt;
    this.behaviorTracker.captureConversation({
      userText,
      assistantText: replyText,
      language: this.state.replyLanguage,
      provider,
      latencyMs
    });
    this.updateState({
      lastAssistantText: replyText,
      lastLatencyMs: latencyMs,
      lastProvider: provider
    });
    return {
      ok: true,
      replyText,
      provider,
      data,
      conversationState: this.getConversationState(replyText)
    };
  }
}
