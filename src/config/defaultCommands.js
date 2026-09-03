export const DEFAULT_COMMANDS = [
  {
    id: "show-brain",
    intent: "show-brain",
    title: "Show AURA Brain",
    description: "Shows the private owner-only view of everything AURA stores locally.",
    examplePhrases: [
      "show my ai brain",
      "show what is stored in your brain",
      "show all stored data"
    ]
  },
  {
    id: "show-memory",
    intent: "show-memory",
    title: "Show Memory",
    description: "Shows memory, learning, recent events, and saved profile facts.",
    examplePhrases: ["show memory", "show database", "show learning data"]
  },
  {
    id: "show-performance",
    intent: "show-performance",
    title: "Show Performance",
    description: "Shows latency, provider usage, and command success rate.",
    examplePhrases: ["show performance", "performance report", "show speed report"]
  },
  {
    id: "show-manual-responses",
    intent: "show-manual-responses",
    title: "Show Manual Responses",
    description: "Shows your custom quick replies from the manual response file.",
    examplePhrases: ["show manual responses"]
  },
  {
    id: "chrome-search",
    intent: "chrome-search",
    title: "Chrome Search",
    description: "Opens Chrome and searches for what you ask.",
    examplePhrases: [
      "open chrome and search latest ai news",
      "search weather in chrome"
    ]
  },
  {
    id: "open-internal-storage",
    intent: "open-internal-storage",
    title: "Internal Storage",
    description: "Opens your C drive in File Explorer.",
    examplePhrases: ["go to internal storage", "open c drive"]
  },
  {
    id: "open-known-folder",
    intent: "open-known-folder",
    title: "Open Known Folder",
    description: "Opens Desktop, Documents, Downloads, Videos, Music, or Pictures.",
    examplePhrases: ["open downloads folder", "open videos folder", "open documents"]
  },
  {
    id: "open-video-file",
    intent: "open-video-file",
    title: "Open Video",
    description: "Searches common folders for a video and opens it.",
    examplePhrases: ["open video trailer", "play video demo"]
  },
  {
    id: "scroll-window",
    intent: "scroll-window",
    title: "Scroll Window",
    description: "Scrolls the active window or reel up or down.",
    examplePhrases: ["scroll down", "scroll up", "next reel", "previous reel"]
  },
  {
    id: "set-language",
    intent: "set-language",
    title: "Change Language",
    description: "Changes AURA reply and listening language.",
    examplePhrases: [
      "speak with me in tamil",
      "change language to english",
      "change language to tanglish"
    ]
  },
  {
    id: "pause-listening",
    intent: "pause-listening",
    title: "Pause Listening",
    description: "Turns off always-listening mode until you re-enable it.",
    examplePhrases: ["pause listening", "stop listening"]
  },
  {
    id: "resume-listening",
    intent: "resume-listening",
    title: "Resume Listening",
    description: "Turns on always-listening mode with no wake word.",
    examplePhrases: ["resume listening", "start listening"]
  },
  {
    id: "add-task",
    intent: "add-task",
    title: "Add Task",
    description: "Stores a personal task in AURA's task list.",
    examplePhrases: ["add task call electrician", "assign task finish project report"]
  },
  {
    id: "show-tasks",
    intent: "show-tasks",
    title: "Show Tasks",
    description: "Shows the tasks currently stored for you.",
    examplePhrases: ["show my tasks", "list tasks"]
  },
  {
    id: "complete-task",
    intent: "complete-task",
    title: "Complete Task",
    description: "Marks a stored task as completed.",
    examplePhrases: ["complete task call electrician", "mark done project report"]
  }
];
