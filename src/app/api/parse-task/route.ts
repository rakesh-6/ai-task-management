import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Server Configuration Error: GEMINI_API_KEY is missing." },
            { status: 500 }
        );
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { input } = await req.json();

        if (!input || typeof input !== "string") {
            return NextResponse.json(
                { error: "Natural language input is required" },
                { status: 400 }
            );
        }

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "A clear, concise description of the task without dates or priority words."
                },
                category: {
                    type: Type.STRING,
                    enum: ["work", "personal"],
                    description: "If a category isn't obvious, default to 'personal'."
                },
                priority: {
                    type: Type.STRING,
                    enum: ["high", "med", "low"],
                    description: "If priority isn't obvious, default to 'med'."
                },
                dueDate: {
                    type: Type.STRING,
                    nullable: true,
                    description: `ISO 8601 date string, or null if no date is specified. Assume today's baseline date is ${new Date().toISOString()}`
                },
                recurrence: {
                    type: Type.STRING,
                    enum: ["daily", "weekly", "monthly"],
                    nullable: true,
                    description: "If the user mentions a repeating schedule (e.g. 'every day', 'weekly'), extract it. Otherwise null."
                }
            },
            required: ["title", "category", "priority"]
        };

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Parse this task: "${input}"`,
            config: {
                systemInstruction: "You are an intelligent task parsing assistant. Extract task details exactly according to the schema.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const parsedContent = response.text;

        if (!parsedContent) {
            throw new Error("No content returned from Gemini");
        }

        const taskData = JSON.parse(parsedContent);
        return NextResponse.json(taskData);

    } catch (error: any) {
        console.error("Task parsing error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to parse task via Gemini" },
            { status: 500 }
        );
    }
}
