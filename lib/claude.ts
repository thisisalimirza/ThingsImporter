import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Task {
  title: string;
  when?: string;      // ISO date YYYY-MM-DD or: today, tomorrow, evening, anytime, someday
  subtasks?: string[]; // prerequisite steps (smart breakdown mode)
}

const today = () => new Date().toISOString().split("T")[0];

const IMAGE_PROMPT = () => `You are a task extraction assistant. I will provide you with an image of handwritten daily journal or task notes.

Your job is to:
1. Extract all tasks, to-dos, action items, and reminders from the image
2. Skip any items that are crossed out or clearly completed
3. Expand abbreviations into full, clear task descriptions
4. If a task mentions a day or date (e.g. "call dentist Friday"), extract that as the "when" field

Return ONLY a JSON array of objects — no explanation, no markdown, no wrapper.

Each object must have:
- "title": string — the task description (5–15 words, capitalized)
- "when": string (optional) — YYYY-MM-DD, or: today, tomorrow, evening, anytime, someday

If no tasks are found, return [].
Today's date is ${today()}.

Example: [{"title": "Buy groceries", "when": "today"}, {"title": "Review PR 42"}]`;

const TEXT_PROMPT = () => `You are a task extraction assistant. I will provide you with a voice transcript of someone dictating their tasks.

Extract all tasks and return ONLY a JSON array of objects — no explanation, no markdown, no wrapper.

Each object must have:
- "title": string — the task description (5–15 words, capitalized)
- "when": string (optional) — YYYY-MM-DD, or: today, tomorrow, evening, anytime, someday

If no tasks are found, return [].
Today's date is ${today()}.`;

const TEXT_BREAKDOWN_PROMPT = () => `You are a productivity coach and task extraction assistant. I will provide you with a voice transcript of someone dictating their tasks.

Extract all tasks. For each task that is large, vague, or multi-step, break it down into 2–4 concrete minimum next steps — the smallest possible actions needed to build momentum and make progress. If a task is already small and specific (e.g. "buy milk"), skip the breakdown.

The goal: replace paralysis-inducing big tasks with a clear first step the person can act on immediately.

Return ONLY a JSON array of objects — no explanation, no markdown, no wrapper.

Each object must have:
- "title": string — the high-level task (5–15 words, capitalized)
- "when": string (optional) — YYYY-MM-DD, or: today, tomorrow, evening, anytime, someday
- "subtasks": string[] (optional) — 2–4 prerequisite steps, each a short imperative phrase

Today's date is ${today()}.

Example:
[
  {
    "title": "Write quarterly report",
    "when": "friday",
    "subtasks": ["Pull Q4 metrics from dashboard", "Draft three-sentence executive summary", "Write body paragraphs", "Send draft to manager for review"]
  },
  {
    "title": "Buy milk",
    "when": "today"
  }
]`;

function parseTaskResponse(text: string): Task[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (t): t is Task =>
      typeof t === "object" &&
      typeof t.title === "string" &&
      t.title.trim().length > 0
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
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: IMAGE_PROMPT() },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];
  return parseTaskResponse(textBlock.text);
}

export async function extractTasksFromText(
  transcript: string,
  smartBreakdown = false
): Promise<Task[]> {
  const prompt = smartBreakdown ? TEXT_BREAKDOWN_PROMPT() : TEXT_PROMPT();

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];
  return parseTaskResponse(textBlock.text);
}
