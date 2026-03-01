import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { tasks } = await req.json();

        const responseSchema: Schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Suggest a task title (be creative but helpful)" },
                    reason: { type: Type.STRING, description: "Why are you suggesting this? (e.g. 'Since you have a lot of work tasks, maybe take a break?')" },
                    category: { type: Type.STRING, enum: ["work", "personal"] },
                    priority: { type: Type.STRING, enum: ["low", "med", "high"] }
                },
                required: ["title", "reason", "category", "priority"]
            }
        };

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Suggest 3 new tasks based on these existing ones: ${JSON.stringify(tasks)}`,
            config: {
                systemInstruction: "You are an expert personal productivity assistant. Suggest 3 NEW tasks that would help the user be more balanced or productive. If they have many work tasks, suggest a personal self-care task. If they have a Personal Project, suggest a related follow-up. Be friendly and encouraging.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        if (!result.text) {
            throw new Error("No content returned from Gemini");
        }

        const suggestions = JSON.parse(result.text);
        return NextResponse.json(suggestions);
    } catch (error: any) {
        console.error("Suggestions Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
