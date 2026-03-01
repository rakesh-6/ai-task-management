"use client";

import { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { type Task } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface TaskInputProps {
    onTaskCreated: (task: Task) => void;
}

export function TaskInput({ onTaskCreated }: TaskInputProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/parse-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) {
                throw new Error("Failed to parse task");
            }

            const data = await response.json();

            const newTask: Task = {
                id: uuidv4(), // Need to install uuid
                title: data.title,
                category: data.category,
                priority: data.priority,
                dueDate: data.dueDate,
                createdAt: new Date().toISOString(),
                completed: false,
            };

            onTaskCreated(newTask);
            setInput("");
        } catch (err: any) {
            setError("I couldn't understand that. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-2">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center w-full p-2 glass rounded-full ring-1 ring-white/10 focus-within:ring-purple-500/50 transition-all shadow-xl"
            >
                <div className="pl-4 pr-3 text-purple-400">
                    <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Fix the dashboard bug tomorrow at high priority"
                    className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-400 focus:outline-none text-lg py-2"
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="ml-2 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-colors"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowUp className="w-5 h-5" />
                    )}
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-sm pl-6 animate-in fade-in slide-in-from-top-2">
                    {error}
                </p>
            )}
        </div>
    );
}
