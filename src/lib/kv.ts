import { createClient } from "redis";
import { Task } from "@/types";

const TASKS_KEY = "ai-tasks-v1";

// Create a standard Redis client that works with REDIS_URL
const client = createClient({
    url: process.env.REDIS_URL || process.env.KV_URL
});

client.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis (this is an async process in Node.js)
let isConnected = false;
async function connect() {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
    }
}

export async function getTasks() {
    try {
        await connect();
        const data = await client.get(TASKS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Redis GET Error:", e);
        return [];
    }
}

export async function saveTasks(tasks: Task[]) {
    try {
        await connect();
        await client.set(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Redis SET Error:", e);
    }
}

export async function addTask(task: Task) {
    const tasks = await getTasks();
    await saveTasks([task, ...tasks]);
}
