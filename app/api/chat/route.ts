// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

// ✅ Ensure environment variable is loaded correctly
const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!apiKey) {
  throw new Error("❌ GROQ_API_KEY environment variable is missing");
}

// ✅ Initialize Groq with API key
const groq = createGroq({ apiKey });

// ✅ Define model instance
const primaryModel = groq("llama-3.3-70b-versatile");

export async function POST(req: NextRequest) {
  try {
    // ✅ Parse JSON safely
    const body = await req.json();
    const messages = body?.messages || [];

    // ✅ Validate request
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty messages array" },
        { status: 400 }
      );
    }

    // ✅ Stream text from Groq model
    const result = await streamText({
      model: primaryModel,
      messages,
    });

    // ✅ Return streaming response properly
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
