import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";

export async function POST(req: Request) {
  const { json, mode } = await req.json();

  // Validate JSON before sending to AI
  try {
    JSON.parse(json);
  } catch (e: any) {
    return NextResponse.json({
      explanation: "⚠️ The JSON you entered is invalid.",
      suggestion: `Error: ${e.message}`,
    });
  }

  const prompt = buildPrompt(json, mode);

  const resp = await fetch(`${process.env.OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      prompt,
      stream: false, // keep simple response (can enable streaming later)
    }),
  });

  const data = await resp.json();

  return NextResponse.json({ explanation: data.response });
}
