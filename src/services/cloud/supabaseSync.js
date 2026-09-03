export class SupabaseSync {
  constructor(cloudConfig) {
    this.cloudConfig = cloudConfig;
  }

  get enabled() {
    return Boolean(
      this.cloudConfig?.url &&
        this.cloudConfig?.apiKey &&
        this.cloudConfig?.table
    );
  }

  async pushRecord(recordType, payload) {
    if (!this.enabled) {
      return { ok: false, reason: "Cloud sync is disabled." };
    }

    const endpoint = `${this.cloudConfig.url}/rest/v1/${this.cloudConfig.table}`;
    const body = [
      {
        record_type: recordType,
        payload,
        created_at: new Date().toISOString()
      }
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.cloudConfig.apiKey,
        Authorization: `Bearer ${this.cloudConfig.apiKey}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(body)
    });

    return {
      ok: response.ok,
      status: response.status
    };
  }
}
