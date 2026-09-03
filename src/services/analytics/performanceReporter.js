function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio));
  return sorted[index];
}

export class PerformanceReporter {
  constructor(database) {
    this.database = database;
  }

  getReport() {
    const snapshot = this.database.getSnapshot();
    const events = snapshot.events ?? [];
    const timedEvents = events.filter((event) => Number(event.latencyMs) > 0);
    const latencies = timedEvents.map((event) => Number(event.latencyMs));
    const conversationEvents = events.filter((event) => event.type === "conversation");
    const commandEvents = events.filter((event) => event.type === "command");
    const providerCounts = new Map();

    for (const event of conversationEvents) {
      const provider = event.metadata?.provider ?? "unknown";
      providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
    }

    const commandSuccessCount = commandEvents.filter((event) => event.success).length;

    return {
      uptimeSignals: {
        totalEvents: events.length,
        totalMemories: snapshot.memories.length,
        totalFacts: Object.keys(snapshot.profile.identity.facts ?? {}).length,
        totalVoiceProfiles: snapshot.profile.voiceProfiles.length
      },
      latency: {
        averageMs: average(latencies),
        p95Ms: percentile(latencies, 0.95),
        fastestMs: latencies.length > 0 ? Math.min(...latencies) : 0,
        slowestMs: latencies.length > 0 ? Math.max(...latencies) : 0,
        last10: timedEvents.slice(0, 10).map((event) => ({
          type: event.type,
          latencyMs: event.latencyMs,
          at: event.createdAt
        }))
      },
      providers: [...providerCounts.entries()].map(([provider, count]) => ({
        provider,
        count
      })),
      commands: {
        total: commandEvents.length,
        successRate:
          commandEvents.length > 0
            ? Number(((commandSuccessCount / commandEvents.length) * 100).toFixed(1))
            : 0
      },
      storage: {
        localDatabase: this.database.filePath,
        cloudSyncEnabled: Boolean(this.database.config?.modes?.cloudSync)
      }
    };
  }

  getSummary() {
    const report = this.getReport();
    return {
      averageLatencyMs: report.latency.averageMs,
      totalEvents: report.uptimeSignals.totalEvents,
      totalFacts: report.uptimeSignals.totalFacts
    };
  }
}
