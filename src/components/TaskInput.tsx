"use client";

import { useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { type Task } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface TaskInputProps {
    onTaskCreated: (task: Task) => void;
}

export function TaskInput({ onTaskCreated }: TaskInputProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch("/api/parse-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to parse task");
            }

            const data = await response.json();

            const newTask: Task = {
                id: uuidv4(),
                title: data.title,
                category: data.category,
                priority: data.priority,
                dueDate: data.dueDate,
                recurrence: data.recurrence,
                createdAt: new Date().toISOString(),
                completed: false,
            };

            onTaskCreated(newTask);
            setInput("");
            toast.success("Task created!", {
                description: `"${data.title}" added to your list.`
            });
        } catch (err: any) {
            toast.error("Parsing Error", {
                description: err.message || "I couldn't understand that. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-2">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center w-full p-2 glass rounded-2xl border border-white/80 shadow-2xl focus-within:ring-2 focus-within:ring-purple-400/50 transition-all"
            >
                <div className="pl-4 pr-3 text-purple-600">
                    <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Fix the dashboard bug tomorrow at high priority"
                    className="flex-1 bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-lg py-2 font-medium"
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="ml-2 flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-all shadow-lg hover:shadow-purple-200 active:scale-95"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowUp className="w-6 h-6" />
                    )}
                </button>
            </form>
        </div>
    );
}
