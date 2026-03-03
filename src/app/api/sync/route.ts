import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { addTask } from "@/lib/kv";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types";

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

    try {
        const { type } = await req.json();

        // Simulate fetching external content based on type
        let content = "";
        let source = "";

        if (type === "email") {
            content = "Subject: Reminder: Project Deadline\nFrom: boss@company.com\nBody: Hey, just a reminder that the Q1 project dashboard needs to be finished by Friday. High priority.";
            source = "Email Sync";
        } else if (type === "slack") {
            content = "Slack message: 'Can someone update the documentation for the API by Wednesday? Needs to be done soon. #dev-channel'";
            source = "Slack Sync";
        } else {
            return NextResponse.json({ error: "Invalid sync type" }, { status: 400 });
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
            model: "gemini-2.5-flash",
            contents: content,
            config: {
                systemInstruction: `You are an assistant that turns ${source} messages into todo tasks. Extract title, category, priority, and due date. Return JSON.`,
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
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
