import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EXTRACTION_PROMPT = `You are a task extraction assistant. I will provide you with an image of handwritten daily journal or task notes.

Your job is to:
1. Extract all tasks, to-dos, action items, and reminders from the image
2. Skip any items that are crossed out or clearly completed
3. Expand abbreviations into full, clear task descriptions
4. Return ONLY a JSON array of strings — no explanation, no markdown, no wrapper object

Rules:
- Each task should be concise but complete (5–15 words ideally)
- Capitalize the first letter of each task
- Do not number the tasks
- If you cannot identify any tasks, return an empty array []
- Return raw JSON only, e.g.: ["Buy groceries", "Call dentist", "Review PR #42"]`;

export async function extractTasksFromImage(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return [];
  }

  const raw = textBlock.text.trim();
  // Strip markdown code fences if Claude wrapped the JSON
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const tasks: string[] = JSON.parse(cleaned);
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => typeof t === "string" && t.trim().length > 0);
}
