export class OllamaClient {
  constructor(config) {
    this.config = config;
  }

  get enabled() {
    return Boolean(this.config?.baseUrl && this.config?.model);
  }

  async respond({ systemPrompt, conversation }) {
    if (!this.enabled) {
      throw new Error("Offline model is not configured.");
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    return payload?.message?.content?.trim() ?? "";
  }
}
