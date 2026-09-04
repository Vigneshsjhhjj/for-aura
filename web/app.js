const state = {
  recognition: null,
  recognitionActive: false,
  shouldListen: false,
  speechSupported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  selectedLanguage: "en-IN",
  ownerToken: "",
  voices: [],
  speaking: false,
  gestureStartY: null,
  mediaRecorder: null,
  voiceStream: null,
  recordedChunks: [],
  voiceProfiles: [],
  assistantSettings: null,
  silenceTimer: null,
  idlePresenceTimer: null,
  awaitingReply: false,
  lastUserActivityAt: 0,
  startupGreetingDone: false
};

const ui = {
  statusText: document.querySelector("#statusText"),
  modeText: document.querySelector("#modeText"),
  latencyText: document.querySelector("#latencyText"),
  voiceStatus: document.querySelector("#voiceStatus"),
  languagePill: document.querySelector("#languagePill"),
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  interimText: document.querySelector("#interimText"),
  listenToggle: document.querySelector("#listenToggle"),
  modeToggle: document.querySelector("#modeToggle"),
  showArchitecture: document.querySelector("#showArchitecture"),
  showMemory: document.querySelector("#showMemory"),
  showPerformance: document.querySelector("#showPerformance"),
  showBrain: document.querySelector("#showBrain"),
  languageSelect: document.querySelector("#languageSelect"),
  ownerToken: document.querySelector("#ownerToken"),
  architectureData: document.querySelector("#architectureData"),
  memoryData: document.querySelector("#memoryData"),
  performanceData: document.querySelector("#performanceData"),
  brainData: document.querySelector("#brainData"),
  avatarStage: document.querySelector("#avatarStage"),
  gesturePad: document.querySelector("#gesturePad"),
  voiceLabel: document.querySelector("#voiceLabel"),
  recordVoice: document.querySelector("#recordVoice"),
  saveVoice: document.querySelector("#saveVoice"),
  voiceProfiles: document.querySelector("#voiceProfiles"),
  voiceStudioStatus: document.querySelector("#voiceStudioStatus")
};

boot().catch((error) => {
  appendMessage("assistant", `Boot error: ${error.message}`);
});

async function boot() {
  bindUi();
  await Promise.allSettled([
    loadLanguages(),
    refreshArchitecture(),
    refreshMemory(),
    refreshPerformance(),
    refreshVoiceProfiles(),
    refreshBrain(),
    refreshState()
  ]);
  connectEventStream();
  hydrateVoices();
  initializeSpeechRecognition();
  await attemptAutoStartListening();
  await attemptStartupGreeting();
  scheduleIdlePresencePrompt();
}

function bindUi() {
  ui.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = ui.chatInput.value.trim();
    if (!text) {
      return;
    }

    ui.chatInput.value = "";
    noteUserActivity();
    await talkToAura(text, "text");
  });

  ui.listenToggle.addEventListener("click", async () => {
    if (!state.speechSupported) {
      ui.voiceStatus.textContent =
        "This browser does not support SpeechRecognition. Use Chrome or Edge.";
      return;
    }

    if (state.shouldListen) {
      stopListening();
      await updatePreferences({ alwaysListen: false });
      return;
    }

    state.shouldListen = true;
    await updatePreferences({ alwaysListen: true });
    startListening();
  });

  ui.modeToggle.addEventListener("click", async () => {
    const nextMode = ui.modeToggle.dataset.onlinePreferred !== "false";
    await postJson("/api/runtime", { onlinePreferred: !nextMode });
  });

  ui.showArchitecture.addEventListener("click", refreshArchitecture);
  ui.showMemory.addEventListener("click", refreshMemory);
  ui.showPerformance.addEventListener("click", refreshPerformance);
  ui.showBrain.addEventListener("click", refreshBrain);

  ui.ownerToken.addEventListener("input", (event) => {
    state.ownerToken = event.target.value.trim();
    if (state.ownerToken) {
      refreshPrivatePanels();
    }
  });

  ui.languageSelect.addEventListener("change", async (event) => {
    const languageId = event.target.value;
    state.selectedLanguage = languageId;
    await updatePreferences({
      inputLanguage: languageId,
      replyLanguage: languageId
    });
    if (state.recognition) {
      state.recognition.lang = languageId === "ta-IN-x-tanglish" ? "ta-IN" : languageId;
    }
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", async () => {
      await talkToAura(button.dataset.command, "button");
    });
  });

  ui.gesturePad.addEventListener("touchstart", (event) => {
    state.gestureStartY = event.touches[0]?.clientY ?? null;
    ui.gesturePad.classList.add("active");
  });

  ui.gesturePad.addEventListener("touchend", async (event) => {
    const endY = event.changedTouches[0]?.clientY ?? null;
    if (state.gestureStartY !== null && endY !== null) {
      const delta = endY - state.gestureStartY;
      if (Math.abs(delta) > 30) {
        await talkToAura(delta > 0 ? "scroll down" : "scroll up", "gesture");
      }
    }
    state.gestureStartY = null;
    ui.gesturePad.classList.remove("active");
  });

  ui.recordVoice.addEventListener("click", toggleVoiceRecording);
  ui.saveVoice.addEventListener("click", saveVoiceSample);
}

async function refreshState() {
  const data = await fetchJson("/api/state");
  renderState(data);
}

async function refreshArchitecture() {
  await runPrivateRefresh(ui.architectureData, "/api/architecture");
}

async function refreshMemory() {
  await runPrivateRefresh(ui.memoryData, "/api/memory");
}

async function refreshPerformance() {
  await runPrivateRefresh(ui.performanceData, "/api/performance");
}

async function refreshVoiceProfiles() {
  try {
    const data = await fetchJson("/api/voice-profiles");
    state.voiceProfiles = data.items ?? [];
    renderVoiceProfiles(data);
  } catch (error) {
    state.voiceProfiles = [];
    ui.voiceProfiles.innerHTML =
      "<p class='voice-note'>Enter your owner token to view saved voice profiles from another device.</p>";
  }
}

async function refreshBrain() {
  try {
    const data = await fetchJson("/api/brain");
    ui.brainData.textContent = JSON.stringify(data, null, 2);
    ui.showBrain.classList.add("active-brain");
  } catch (error) {
    ui.brainData.textContent =
      "Private brain view is protected. Open locally on your laptop or enter your owner token.";
    ui.showBrain.classList.remove("active-brain");
  }
}

async function loadLanguages() {
  const payload = await fetchJson("/api/languages");
  const fragment = document.createDocumentFragment();

  payload.languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.id;
    option.textContent = language.label;
    fragment.appendChild(option);
  });

  ui.languageSelect.innerHTML = "";
  ui.languageSelect.appendChild(fragment);
}

function connectEventStream() {
  const events = new EventSource("/api/events");
  events.onmessage = async (event) => {
    const payload = JSON.parse(event.data);
    renderState(payload);
    ui.memoryData.textContent = JSON.stringify(
      {
        preferences: payload.preferences,
        learning: payload.learning
      },
      null,
      2
    );
    ui.performanceData.textContent = JSON.stringify(payload.performance, null, 2);
    renderVoiceProfiles(payload.voiceProfiles);
  };
}

function renderState(payload) {
  const publicState = payload.state;
  state.selectedLanguage = publicState.inputLanguage;
  state.assistantSettings = payload.assistantSettings ?? null;
  state.shouldListen = Boolean(publicState.listening);
  state.awaitingReply = Boolean(publicState.awaitingReply);

  ui.statusText.textContent = publicState.listening ? "Listening" : "Idle";
  ui.modeText.textContent = publicState.onlinePreferred
    ? "Online Preferred"
    : "Offline Preferred";
  ui.modeToggle.dataset.onlinePreferred = String(publicState.onlinePreferred);
  ui.modeToggle.textContent = publicState.onlinePreferred
    ? "Switch To Offline"
    : "Switch To Online";
  ui.latencyText.textContent = `${publicState.lastLatencyMs ?? 0} ms`;
  ui.languagePill.textContent = publicState.replyLanguage;
  ui.languageSelect.value = publicState.replyLanguage;
  ui.listenToggle.textContent = publicState.listening ? "Stop Listening" : "Start Listening";
  ui.voiceStatus.textContent = publicState.speaking
    ? "AURA is speaking."
    : publicState.listening
      ? "AURA is actively listening with no wake word."
      : "Listening is paused.";
  ui.avatarStage.classList.toggle("listening", Boolean(publicState.listening));
  ui.avatarStage.classList.toggle("speaking", Boolean(publicState.speaking));
}

async function talkToAura(text, source) {
  appendMessage("user", text);
  clearSilenceFollowUp();
  clearIdlePresencePrompt();
  ui.interimText.textContent = "Sending to AURA...";
  const payload = await postJson("/api/talk", { text, source });
  appendMessage("assistant", payload.replyText);

  if (payload.data) {
    const json = JSON.stringify(payload.data, null, 2);
    if (payload.action === "show-architecture") {
      ui.architectureData.textContent = json;
    }
    if (payload.action === "show-memory") {
      ui.memoryData.textContent = json;
    }
    if (payload.action === "show-brain" || payload.action === "show-default-commands" || payload.action === "show-manual-responses") {
      ui.brainData.textContent = json;
    }
    if (payload.action === "show-performance") {
      ui.performanceData.textContent = json;
    }
  }

  ui.interimText.textContent = "Waiting for speech...";
  await refreshMemory();
  await refreshPerformance();
  await refreshVoiceProfiles();
  await refreshBrain();
  await speak(payload.replyText);
  scheduleSilenceFollowUp(payload.conversationState);
  scheduleIdlePresencePrompt();
}

function appendMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  article.innerHTML = `<small>${role === "user" ? "You" : "AURA"}</small>${escapeHtml(text)}`;
  ui.chatLog.prepend(article);
}

function hydrateVoices() {
  const loadVoices = () => {
    state.voices = window.speechSynthesis.getVoices();
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function renderVoiceProfiles(payload) {
  const items = payload?.items ?? [];
  const activeVoiceProfileId = payload?.activeVoiceProfileId ?? null;
  ui.voiceProfiles.innerHTML = "";

  if (items.length === 0) {
    ui.voiceProfiles.innerHTML =
      "<p class='voice-note'>No stored custom voice sample yet. Record one below.</p>";
    return;
  }

  items.forEach((voiceProfile) => {
    const article = document.createElement("article");
    article.className = "voice-profile";
    const isActive = voiceProfile.id === activeVoiceProfileId;
    article.innerHTML = `
      <strong>${escapeHtml(voiceProfile.label)}</strong>
      <span>${escapeHtml(voiceProfile.fileName)}</span>
      <span>${isActive ? "Active sample" : "Stored sample"}</span>
    `;

    if (!isActive) {
      const button = document.createElement("button");
      button.className = "quick-action";
      button.textContent = "Use This Voice Sample";
      button.addEventListener("click", async () => {
        await postJson("/api/voice-profiles/activate", {
          voiceProfileId: voiceProfile.id
        });
        ui.voiceStudioStatus.textContent =
          "Voice sample changed. Browser speech is still active unless you connect custom TTS.";
        await refreshVoiceProfiles();
      });
      article.appendChild(button);
    }

    ui.voiceProfiles.appendChild(article);
  });
}

async function attemptAutoStartListening() {
  if (!state.speechSupported || !state.assistantSettings?.modes?.autoStartListeningOnLoad) {
    return;
  }

  if (!state.assistantSettings.modes.alwaysListen) {
    return;
  }

  try {
    startListening();
  } catch (error) {
    ui.voiceStatus.textContent =
      "Auto-start is ready, but this browser wants one click before microphone listening begins.";
  }
}

async function attemptStartupGreeting() {
  if (!state.assistantSettings?.modes?.startupGreetingEnabled) {
    return;
  }

  if (sessionStorage.getItem("aura-startup-greeting") === "done") {
    return;
  }

  try {
    const payload = await postJson("/api/presence-prompt", {
      reason: "startup-greeting"
    });
    appendMessage("assistant", payload.replyText);
    await refreshMemory();
    await refreshBrain();
    await speak(payload.replyText);
    sessionStorage.setItem("aura-startup-greeting", "done");
    state.startupGreetingDone = true;
  } catch (error) {
    ui.voiceStatus.textContent = `Startup greeting error: ${error.message}`;
  }
}

function initializeSpeechRecognition() {
  if (!state.speechSupported) {
    ui.voiceStatus.textContent =
      "SpeechRecognition is not available here. Use Chrome or Edge for no-wake voice mode.";
    return;
  }

  const RecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new RecognitionClass();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;

  recognition.onresult = async (event) => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        continue;
      }

      if (result.isFinal) {
        noteUserActivity();
        ui.interimText.textContent = transcript;
        await talkToAura(transcript, "voice");
      } else {
        interimText = transcript;
      }
    }

    if (interimText) {
      ui.interimText.textContent = interimText;
    }
  };

  recognition.onerror = (event) => {
    ui.voiceStatus.textContent = `Voice error: ${event.error}`;
  };

  recognition.onend = () => {
    state.recognitionActive = false;
    if (state.shouldListen && !state.speaking) {
      window.setTimeout(() => {
        startListening();
      }, 250);
    }
  };

  state.recognition = recognition;
}

function startListening() {
  if (!state.recognition || state.recognitionActive) {
    return;
  }

  state.shouldListen = true;
  state.recognition.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;
  try {
    state.recognition.start();
    state.recognitionActive = true;
  } catch (error) {
    ui.voiceStatus.textContent =
      "Microphone start was blocked by the browser. Click Start Listening once and AURA will stay wake-word free after that.";
  }
}

function stopListening() {
  if (state.recognition && state.recognitionActive) {
    state.recognition.stop();
  }
  state.recognitionActive = false;
}

async function speak(text) {
  if (!("speechSynthesis" in window) || !text) {
    return;
  }

  state.speaking = true;
  stopListening();
  await postJson("/api/runtime", { speaking: true });

  await new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.selectedLanguage === "ta-IN-x-tanglish" ? "ta-IN" : state.selectedLanguage;
    utterance.rate = state.assistantSettings?.voices?.rate ?? 1;
    utterance.pitch = state.assistantSettings?.voices?.pitch ?? 1;
    utterance.volume = state.assistantSettings?.voices?.volume ?? 1;

    const preferredNames = state.assistantSettings?.voices?.preferredVoiceNames ?? [];
    const matchingVoice =
      state.voices.find((voice) => preferredNames.includes(voice.name)) ??
      state.voices.find((voice) => voice.lang === utterance.lang) ??
      state.voices.find((voice) => voice.lang.startsWith(utterance.lang.split("-")[0])) ??
      null;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });

  state.speaking = false;
  await postJson("/api/runtime", { speaking: false });
  if (state.shouldListen) {
    startListening();
  }
}

function scheduleSilenceFollowUp(conversationState) {
  clearSilenceFollowUp();

  if (!conversationState?.allowSilenceFollowUp) {
    state.awaitingReply = false;
    return;
  }

  state.awaitingReply = true;
  const delayMs =
    conversationState.followUpDelayMs ??
    state.assistantSettings?.modes?.proactiveFollowUpMs ??
    16000;

  state.silenceTimer = window.setTimeout(async () => {
    if (!state.awaitingReply) {
      return;
    }

    const silenceMs = Date.now() - state.lastUserActivityAt;
    if (silenceMs < delayMs - 500) {
      return;
    }

    try {
      const payload = await postJson("/api/proactive-follow-up", {});
      appendMessage("assistant", payload.replyText);
      await refreshMemory();
      await refreshPerformance();
      await refreshBrain();
      await speak(payload.replyText);
    } catch (error) {
      ui.voiceStatus.textContent = `Follow-up error: ${error.message}`;
    } finally {
      state.awaitingReply = false;
      clearSilenceFollowUp();
    }
  }, delayMs);
}

function clearSilenceFollowUp() {
  if (state.silenceTimer) {
    window.clearTimeout(state.silenceTimer);
    state.silenceTimer = null;
  }
}

function scheduleIdlePresencePrompt() {
  clearIdlePresencePrompt();

  if (!state.assistantSettings?.modes?.idlePresenceEnabled) {
    return;
  }

  const idleMs = state.assistantSettings.modes.idlePresenceMs ?? 300000;
  state.idlePresenceTimer = window.setTimeout(async () => {
    try {
      const payload = await postJson("/api/presence-prompt", {
        reason: "idle-help"
      });
      appendMessage("assistant", payload.replyText);
      await refreshMemory();
      await refreshBrain();
      await speak(payload.replyText);
    } catch (error) {
      ui.voiceStatus.textContent = `Idle prompt error: ${error.message}`;
    } finally {
      clearIdlePresencePrompt();
    }
  }, idleMs);
}

function clearIdlePresencePrompt() {
  if (state.idlePresenceTimer) {
    window.clearTimeout(state.idlePresenceTimer);
    state.idlePresenceTimer = null;
  }
}

function noteUserActivity() {
  state.lastUserActivityAt = Date.now();
  state.awaitingReply = false;
  clearSilenceFollowUp();
  clearIdlePresencePrompt();
}

async function toggleVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    ui.voiceStudioStatus.textContent =
      "This browser does not support voice recording here.";
    return;
  }

  if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
    state.mediaRecorder.stop();
    ui.recordVoice.textContent = "Record Voice";
    ui.voiceStudioStatus.textContent = "Recording stopped. Save the sample if it sounds good.";
    return;
  }

  state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  state.recordedChunks = [];
  state.mediaRecorder = new MediaRecorder(state.voiceStream);
  state.mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      state.recordedChunks.push(event.data);
    }
  };
  state.mediaRecorder.onstop = () => {
    state.voiceStream?.getTracks().forEach((track) => track.stop());
  };
  state.mediaRecorder.start();
  ui.recordVoice.textContent = "Stop Recording";
  ui.voiceStudioStatus.textContent = "Recording your voice sample now. Speak clearly for 5 to 10 seconds.";
}

async function saveVoiceSample() {
  if (state.recordedChunks.length === 0) {
    ui.voiceStudioStatus.textContent = "Record a voice sample first.";
    return;
  }

  const blob = new Blob(state.recordedChunks, { type: "audio/webm" });
  const base64Audio = await blobToBase64(blob);
  const label = ui.voiceLabel.value.trim() || "My Voice";

  const payload = await postJson("/api/voice-profiles", {
    label,
    mimeType: blob.type || "audio/webm",
    base64Audio
  });

  ui.voiceStudioStatus.textContent = payload.message;
  state.recordedChunks = [];
  ui.voiceLabel.value = "";
  await refreshVoiceProfiles();
}

async function updatePreferences(patch) {
  await postJson("/api/preferences", patch);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: buildAuthHeaders(false)
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(true)
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

async function runPrivateRefresh(target, url) {
  try {
    const data = await fetchJson(url);
    target.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    target.textContent =
      "Private owner-only data is hidden here. Open the dashboard on your laptop or enter your owner token.";
  }
}

async function refreshPrivatePanels() {
  await Promise.allSettled([
    refreshArchitecture(),
    refreshMemory(),
    refreshPerformance(),
    refreshVoiceProfiles(),
    refreshBrain()
  ]);
}

function buildAuthHeaders(includeJsonContentType) {
  return {
    ...(includeJsonContentType ? {} : {}),
    ...(state.ownerToken ? { "X-Aura-Owner-Token": state.ownerToken } : {})
  };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
