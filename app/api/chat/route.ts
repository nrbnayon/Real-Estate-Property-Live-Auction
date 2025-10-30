import { NextRequest } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY environment variable is missing");
}

const groq = createGroq({ apiKey });
const primaryModel = groq("llama-3.3-70b-versatile");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Invalid or empty messages array" },
        { status: 400 }
      );
    }

    const result = await streamText({
      model: primaryModel,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
