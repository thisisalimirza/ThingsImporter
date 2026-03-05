import { NextRequest, NextResponse } from "next/server";

interface SubtaskPayload {
  content: string;
}

interface TaskPayload {
  title: string;
  when?: string;
  subtasks?: string[];
}

// Map our "when" values to Todoist due_string format
function toTodoistDue(when: string): string | undefined {
  if (when === "anytime" || when === "someday") return undefined;
  if (when === "evening") return "today evening";
  return when; // today, tomorrow, YYYY-MM-DD all work natively in Todoist
}

export async function POST(req: NextRequest) {
  try {
    const { token, tasks } = await req.json() as { token: string; tasks: TaskPayload[] };

    if (!token) return NextResponse.json({ error: "No API token provided" }, { status: 400 });
    if (!tasks?.length) return NextResponse.json({ error: "No tasks provided" }, { status: 400 });

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let created = 0;

    for (const task of tasks) {
      // Create the parent task
      const due = task.when ? toTodoistDue(task.when) : undefined;
      const taskRes = await fetch("https://api.todoist.com/rest/v2/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: task.title,
          ...(due ? { due_string: due } : {}),
        }),
      });

      if (!taskRes.ok) {
        const err = await taskRes.text();
        // 401 = bad token, surface clearly
        if (taskRes.status === 401) {
          return NextResponse.json(
            { error: "Invalid API token. Please check your token and try again." },
            { status: 401 }
          );
        }
        return NextResponse.json({ error: `Todoist error: ${err}` }, { status: 502 });
      }

      const parentTask = await taskRes.json();
      created++;

      // Create subtasks under the parent
      if (task.subtasks?.length) {
        for (const sub of task.subtasks) {
          await fetch("https://api.todoist.com/rest/v2/tasks", {
            method: "POST",
            headers,
            body: JSON.stringify({ content: sub, parent_id: parentTask.id }),
          });
        }
      }
    }

    return NextResponse.json({ created });
  } catch (err) {
    console.error("Todoist route error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Verify a token is valid without creating anything
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  const res = await fetch("https://api.todoist.com/rest/v2/projects", {
    headers: { "Authorization": `Bearer ${token}` },
  });

  return NextResponse.json({ valid: res.ok });
}
