export class OpenAIClient {
  constructor(config) {
    this.config = config;
  }

  get enabled() {
    return Boolean(this.config?.apiKey && this.config?.model && this.config?.baseUrl);
  }

  async respond({ systemPrompt, conversation }) {
    if (!this.enabled) {
      throw new Error("OpenAI is not configured.");
    }

    const apiMode = this.config.apiMode ?? "chat_completions";
    return apiMode === "responses"
      ? this.respondWithResponsesApi({ systemPrompt, conversation })
      : this.respondWithChatCompletions({ systemPrompt, conversation });
  }

  async respondWithChatCompletions({ systemPrompt, conversation }) {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversation
        ]
      })
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(`OpenAI chat completions failed: ${response.status} ${failureText}`);
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content?.trim() ?? "";
  }

  async respondWithResponsesApi({ systemPrompt, conversation }) {
    const response = await fetch(`${this.config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }]
          },
          ...conversation.map((message) => ({
            role: message.role,
            content: [{ type: "input_text", text: message.content }]
          }))
        ]
      })
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(`OpenAI responses API failed: ${response.status} ${failureText}`);
    }

    const payload = await response.json();
    const outputText = payload?.output_text?.trim?.();

    if (outputText) {
      return outputText;
    }

    const firstText = payload?.output?.[0]?.content?.[0]?.text?.trim?.();
    return firstText ?? "";
  }
}
