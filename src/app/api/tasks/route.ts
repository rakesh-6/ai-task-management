import { NextResponse } from "next/server";
import { getTasks, saveTasks } from "@/lib/kv";

export async function GET() {
    try {
        const tasks = await getTasks();
        return NextResponse.json(tasks);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { tasks } = await req.json();
        await saveTasks(tasks);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
