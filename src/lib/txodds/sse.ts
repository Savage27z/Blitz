export type SseMessageHandler = (data: string, eventName?: string) => void;

/** Parse SSE frames from a byte stream (handles named events, not just `message`). */
export async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onMessage: SseMessageHandler,
  signal?: AbortSignal
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName: string | undefined;
  let dataLines: string[] = [];

  const flush = () => {
    if (dataLines.length === 0) return;
    const payload = dataLines.join("\n");
    dataLines = [];
    const name = eventName;
    eventName = undefined;
    if (payload && payload !== "heartbeat") onMessage(payload, name);
  };

  try {
    while (!signal?.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line === "") {
          flush();
          continue;
        }
        if (line.startsWith(":")) continue;
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          continue;
        }
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }
    }
    flush();
  } finally {
    reader.releaseLock();
  }
}
