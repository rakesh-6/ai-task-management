import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { addTask } from "@/lib/kv";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types";

/**
 * Handle incoming emails from a service like SendGrid Inbound Parse or Postmark.
 * Typical payload contains 'subject', 'from', 'text' or 'html'.
 */
export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    try {
        const body = await req.json();

        // Extract common email fields
        const subject = body.subject || "";
        const from = body.from || "";
        const text = body.text || body.html || "";

        if (!text && !subject) {
            return NextResponse.json({ ok: true, message: "Empty email, skipping" });
        }

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
            contents: `Subject: ${subject}\n\nFrom: ${from}\n\nBody: ${text}`,
            config: {
                systemInstruction: "You are an assistant that turns emails into todo tasks. Subject and body are provided. Extract title, category (work/personal), priority (high/med/low), and due date (ISO string).",
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
        console.error("Email Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
