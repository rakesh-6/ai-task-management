import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { addTask } from "@/lib/kv";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types";

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    try {
        // Slack sends a 'text' field in its challenge/post payload
        const body = await req.json();

        // Handle Slack challenge if necessary
        if (body.challenge) {
            return NextResponse.json({ challenge: body.challenge });
        }

        const slackText = body.event?.text || body.text || "";
        if (!slackText) return NextResponse.json({ ok: true });

        const ai = new GoogleGenAI({ apiKey });

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["work", "personal"] },
                priority: { type: Type.STRING, enum: ["high", "med", "low"] },
                dueDate: { type: Type.STRING, nullable: true }
            },
            required: ["title", "category", "priority"]
        };

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Slack message: "${slackText}"`,
            config: {
                systemInstruction: "Turn this Slack message into a todo task. Extract title, category, priority, and due date. Return JSON.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        if (!result.text) {
            throw new Error("No text returned from Gemini");
        }
        const taskData = JSON.parse(result.text);

        const newTask: Task = {
            id: uuidv4(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };

        await addTask(newTask);

        return NextResponse.json({ ok: true, task: newTask });
    } catch (error: any) {
        console.error("Slack Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
