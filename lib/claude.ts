import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Task {
  title: string;
  when?: string; // ISO date YYYY-MM-DD or: today, tomorrow, evening, anytime, someday
}

const IMAGE_PROMPT = `You are a task extraction assistant. I will provide you with an image of handwritten daily journal or task notes.

Your job is to:
1. Extract all tasks, to-dos, action items, and reminders from the image
2. Skip any items that are crossed out or clearly completed
3. Expand abbreviations into full, clear task descriptions
4. If a task mentions a day or date (e.g. "call dentist Friday", "submit report by Monday"), extract that as the "when" field

Return ONLY a JSON array of objects — no explanation, no markdown, no wrapper.

Each object must have:
- "title": string — the task description (5–15 words, capitalized)
- "when": string (optional) — use YYYY-MM-DD for specific dates, or one of: today, tomorrow, evening, anytime, someday

If no tasks are found, return [].

Today's date is ${new Date().toISOString().split("T")[0]}.

Example output:
[
  {"title": "Buy groceries", "when": "today"},
  {"title": "Call dentist", "when": "2026-03-07"},
  {"title": "Review pull request 42"}
]`;

const TEXT_PROMPT = `You are a task extraction assistant. I will provide you with a voice transcript of someone dictating their tasks.

Your job is to:
1. Extract all tasks, to-dos, action items, and reminders from the transcript
2. Expand abbreviations into full, clear task descriptions
3. If a task mentions a day or date, extract that as the "when" field

Return ONLY a JSON array of objects — no explanation, no markdown, no wrapper.

Each object must have:
- "title": string — the task description (5–15 words, capitalized)
- "when": string (optional) — use YYYY-MM-DD for specific dates, or one of: today, tomorrow, evening, anytime, someday

If no tasks are found, return [].

Today's date is ${new Date().toISOString().split("T")[0]}.`;

function parseTaskResponse(text: string): Task[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (t): t is Task => typeof t === "object" && typeof t.title === "string" && t.title.trim().length > 0
  );
}

export async function extractTasksFromImage(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<Task[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          { type: "text", text: IMAGE_PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];
  return parseTaskResponse(textBlock.text);
}

export async function extractTasksFromText(transcript: string): Promise<Task[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `${TEXT_PROMPT}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];
  return parseTaskResponse(textBlock.text);
}
