export const LANGUAGE_OPTIONS = [
  { id: "en-US", label: "English (US)", aliases: ["english", "speak english", "english us"] },
  { id: "en-IN", label: "English (India)", aliases: ["indian english", "english india"] },
  { id: "ta-IN", label: "Tamil", aliases: ["tamil", "tamizh"] },
  { id: "ta-IN-x-tanglish", label: "Tanglish", aliases: ["tanglish", "tamil english mix", "tamil mix"] },
  { id: "hi-IN", label: "Hindi", aliases: ["hindi"] },
  { id: "te-IN", label: "Telugu", aliases: ["telugu"] }
];

export function findLanguageByText(text) {
  const normalized = text.toLowerCase();
  return LANGUAGE_OPTIONS.find((language) =>
    language.aliases.some((alias) => normalized.includes(alias))
  );
}
