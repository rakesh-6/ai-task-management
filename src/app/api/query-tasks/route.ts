import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { query, tasks } = await req.json();

        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                filteredTaskIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "The IDs of the tasks that match the user's natural language query."
                },
                explanation: {
                    type: Type.STRING,
                    description: "A brief, friendly explanation of what was found."
                }
            },
            required: ["filteredTaskIds", "explanation"]
        };

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Query: "${query}" on Tasks: ${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, category: t.category, priority: t.priority, dueDate: t.dueDate, completed: t.completed })))}`,
            config: {
                systemInstruction: "You are a task search assistant. Filter task IDs based on the user's query. Match categories, priorities, dates, or keywords. If they ask for 'work tasks', include all work category. If they ask for 'due today', match dates. Be smart about synonyms. Be friendly in the explanation.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        if (!result.text) {
            throw new Error("No content returned from Gemini");
        }

        const searchResult = JSON.parse(result.text);
        return NextResponse.json(searchResult);
    } catch (error: any) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
