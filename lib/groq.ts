// lib/groq.ts - Server-side only
import { createGroq } from "@ai-sdk/groq";

const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!apiKey) {
  console.error("GROQ_API_KEY is not set in environment variables");
  throw new Error("GROQ_API_KEY environment variable is required");
}

export const groq = createGroq({
  apiKey: apiKey,
});

export const primaryModel = groq("llama-3.3-70b-versatile");
export const fallbackModel = groq("llama-3.1-8b-instant");
