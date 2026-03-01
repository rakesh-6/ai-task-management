import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "dummy_key_for_build") {
        return NextResponse.json(
            { error: "Server Configuration Error: OPENAI_API_KEY is missing." },
            { status: 500 }
        );
    }
    const openai = new OpenAI({ apiKey });
    try {
        const { input } = await req.json();

        if (!input || typeof input !== "string") {
            return NextResponse.json(
                { error: "Natural language input is required" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // fast and effective for parsing
            messages: [
                {
                    role: "system",
                    content: `You are an intelligent task parsing assistant. 
Extract the task details from the user's natural language input.
Return a JSON object matching this schema exactly:
{
  "title": "A clear, concise description of the task",
  "category": "work" | "personal",
  "priority": "high" | "med" | "low",
  "dueDate": "ISO 8601 date string, or null if no date is specified. Assume current time is ${new Date().toISOString()} for relative dates."
}
If a category isn't obvious, default to "personal".
If priority isn't obvious, default to "med".`
                },
                {
                    role: "user",
                    content: input,
                }
            ],
            response_format: { type: "json_object" },
        });

        const parsedContent = completion.choices[0].message.content;
        if (!parsedContent) {
            throw new Error("No content returned from OpenAI");
        }

        const taskData = JSON.parse(parsedContent);
        return NextResponse.json(taskData);
    } catch (error) {
        console.error("Task parsing error:", error);
        return NextResponse.json(
            { error: "Failed to parse task" },
            { status: 500 }
        );
    }
}
