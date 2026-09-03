function cleanValue(value) {
  return value
    .trim()
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ");
}

export function extractPersonalFacts(text) {
  const facts = [];
  const nameMatch =
    text.match(/\bmy name is\s+([a-z][a-z\s'-]{0,40})/i) ||
    text.match(/\bcall me\s+([a-z][a-z\s'-]{0,40})/i);

  if (nameMatch) {
    facts.push({
      key: "preferredName",
      value: cleanValue(nameMatch[1])
    });
  }

  return facts;
}

export function answerPersonalFactQuestion(text, profile, ownerName = "") {
  const normalized = text.toLowerCase();
  const preferredName = profile.identity?.preferredName?.trim();

  if (
    /\b(what is my name|what's my name|tell me my name|who am i|do you remember my name)\b/i.test(
      normalized
    )
  ) {
    if (preferredName) {
      return `Your name is ${preferredName}. I have it saved in your long-term memory.`;
    }

    return "I do not know your name yet. Say 'my name is ...' and I will remember it.";
  }

  if (
    /\b(what is our owner name|who is our owner|who is your owner|what is your owner name)\b/i.test(
      normalized
    )
  ) {
    if (ownerName) {
      return `His name is ${ownerName}.`;
    }

    return "I do not have the owner name configured yet.";
  }

  return null;
}
