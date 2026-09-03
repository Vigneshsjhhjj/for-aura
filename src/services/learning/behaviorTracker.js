export class BehaviorTracker {
  constructor(database) {
    this.database = database;
  }

  captureVoiceEvent({ text, language, source }) {
    this.database.addEvent({
      type: "voice",
      text,
      success: true,
      metadata: { language, source }
    });
  }

  captureCommand({ text, actionName, success, latencyMs, metadata = {} }) {
    this.database.addEvent({
      type: "command",
      text,
      success,
      latencyMs,
      metadata: {
        ...metadata,
        actionName
      }
    });

    if (success) {
      this.database.recordRoutine(actionName, text);
    }
  }

  captureConversation({ userText, assistantText, language, provider, latencyMs }) {
    this.database.addEvent({
      type: "conversation",
      text: userText,
      success: true,
      latencyMs,
      metadata: {
        language,
        provider
      }
    });

    this.database.addMemory({
      kind: "conversation",
      text: `User: ${userText}\nAURA: ${assistantText}`,
      language,
      tags: ["conversation", provider],
      importance: 2
    });
  }

  updateProfileFromInteraction({ text }) {
    const lower = text.toLowerCase();
    this.database.updateProfile((profile) => {
      const nextProfile = { ...profile };

      if (lower.includes("chrome")) {
        nextProfile.favoriteApps = uniquePush(nextProfile.favoriteApps, "chrome");
      }

      if (lower.includes("youtube")) {
        nextProfile.favoriteWebsites = uniquePush(nextProfile.favoriteWebsites, "youtube");
      }

      if (lower.includes("tamil")) {
        nextProfile.languagesUsed = uniquePush(nextProfile.languagesUsed, "ta-IN");
      }

      if (lower.includes("english")) {
        nextProfile.languagesUsed = uniquePush(nextProfile.languagesUsed, "en-US");
      }

      return nextProfile;
    });
  }

  getSummary() {
    return this.database.getLearningSummary();
  }
}

function uniquePush(list, value) {
  const next = [...list];
  if (!next.includes(value)) {
    next.push(value);
  }
  return next;
}
