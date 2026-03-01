"use client";

import { useEffect, useState } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { TaskInput } from "./TaskInput";
import { TaskCard } from "./TaskCard";
import { Filter, SortDesc, BoxSelect } from "lucide-react";

export function TaskDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");
    const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "priority">("date");
    const [isClient, setIsClient] = useState(false);

    // Hydration state
    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem("ai-tasks");
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load tasks");
            }
        }
    }, []);

    // Persist
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("ai-tasks", JSON.stringify(tasks));
        }
    }, [tasks, isClient]);

    const handleTaskCreated = (newTask: Task) => {
        setTasks((prev) => [newTask, ...prev]);
    };

    const toggleStatus = (id: string) => {
        setTasks((prev) =>
            prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        );
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter(t => t.id !== id));
    };

    const filteredTasks = tasks.filter(task => {
        if (filterCategory !== "all" && task.category !== filterCategory) return false;
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;
        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // completed always at bottom
        }

        if (sortBy === "priority") {
            const pMap = { high: 3, med: 2, low: 1 };
            return pMap[b.priority] - pMap[a.priority];
        } else {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
    });

    if (!isClient) {
        return null; // Return nothing on first render to avoid hydration mismatch
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 pb-24">

            {/* Hero Section */}
            <section className="text-center space-y-4">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent pb-2">
                    Your Mind. Managed.
                </h1>
                <p className="text-lg text-slate-400">
                    Just type what you need to do, and let AI shape your day.
                </p>
            </section>

            {/* Input Section */}
            <section className="relative z-10 w-full">
                <TaskInput onTaskCreated={handleTaskCreated} />
            </section>

            {/* Controls & List Section */}
            <section className="space-y-6">
                <div className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center px-6">

                    <div className="flex gap-4 items-center w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-white/5 rounded-lg border border-white/5 p-1">
                            <Filter className="w-4 h-4 ml-2 text-slate-400" />
                            <select
                                title="Filter by category"
                                className="bg-transparent border-none outline-none cursor-pointer py-1 px-2 focus:ring-0"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as any)}
                            >
                                <option value="all" className="bg-slate-900">All Categories</option>
                                <option value="work" className="bg-slate-900">Work</option>
                                <option value="personal" className="bg-slate-900">Personal</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-white/5 rounded-lg border border-white/5 p-1">
                            <select
                                title="Filter by priority"
                                className="bg-transparent border-none outline-none cursor-pointer py-1 px-2 focus:ring-0"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value as any)}
                            >
                                <option value="all" className="bg-slate-900">All Priorities</option>
                                <option value="high" className="bg-slate-900">High</option>
                                <option value="med" className="bg-slate-900">Medium</option>
                                <option value="low" className="bg-slate-900">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-white/5 rounded-lg border border-white/5 p-1 w-full sm:w-auto">
                        <SortDesc className="w-4 h-4 ml-2 text-slate-400" />
                        <select
                            title="Sort tasks"
                            className="bg-transparent border-none outline-none cursor-pointer py-1 px-2 focus:ring-0"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="date" className="bg-slate-900">Sort by Date</option>
                            <option value="priority" className="bg-slate-900">Sort by Priority</option>
                        </select>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedTasks.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
                            <BoxSelect className="w-16 h-16 opacity-20" />
                            <p>Nothing on your list. Catch a breath!</p>
                        </div>
                    ) : (
                        sortedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggleStatus={toggleStatus}
                                onDelete={deleteTask}
                            />
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
