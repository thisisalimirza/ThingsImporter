import { NextRequest, NextResponse } from "next/server";
import { extractTasksFromImage, extractTasksFromText } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Voice / text mode
    if (typeof body.text === "string") {
      const text = body.text.trim();
      if (!text) return NextResponse.json({ error: "Empty transcript" }, { status: 400 });
      const tasks = await extractTasksFromText(text);
      return NextResponse.json({ tasks });
    }

    // Image mode
    const { image, mediaType } = body as {
      image: string;
      mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    };

    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(mediaType)) {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
    }

    const tasks = await extractTasksFromImage(image, mediaType);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Extract route error:", err);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
