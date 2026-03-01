"use client";

import { useEffect, useState } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { TaskInput } from "./TaskInput";
import { TaskCard } from "./TaskCard";
import { AISuggestions } from "./AISuggestions";
import { SmartSearch } from "./SmartSearch";
import { Filter, SortDesc, BoxSelect, Sparkles, Wand2, X, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, addWeeks, addMonths } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export function TaskDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");
    const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "priority">("date");
    const [isClient, setIsClient] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [useCloud, setUseCloud] = useState(false);

    // AI Search State
    const [searchMatchingIds, setSearchMatchingIds] = useState<string[] | null>(null);
    const [searchExplanation, setSearchExplanation] = useState<string | null>(null);

    // Initial Load - Local + Cloud Merge
    useEffect(() => {
        setIsClient(true);
        const localSaved = localStorage.getItem("ai-tasks");
        if (localSaved) {
            try {
                setTasks(JSON.parse(localSaved));
            } catch (e) {
                console.error("Failed to load local tasks");
            }
        }

        // Try to fetch cloud tasks
        const fetchCloud = async () => {
            try {
                const res = await fetch("/api/tasks");
                if (res.ok) {
                    const cloudTasks = await res.json();
                    if (cloudTasks && cloudTasks.length > 0) {
                        setTasks(prev => {
                            const existingIds = new Set(prev.map(t => t.id));
                            const uniqueFromCloud = cloudTasks.filter((ct: Task) => !existingIds.has(ct.id));
                            return [...prev, ...uniqueFromCloud];
                        });
                        setUseCloud(true);
                    }
                }
            } catch (e) {
                console.log("Cloud sync skipped (probably local dev)");
            }
        };
        fetchCloud();
    }, []);

    // Persist to LocalStorage
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("ai-tasks", JSON.stringify(tasks));
        }
    }, [tasks, isClient]);

    const syncToCloud = async () => {
        if (!isClient) return;
        setIsSyncing(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tasks }),
            });
            if (res.ok) {
                toast.success("Sync complete!", { description: "Your tasks are safe in the cloud." });
                setUseCloud(true);
            } else {
                throw new Error();
            }
        } catch (e) {
            toast.error("Cloud Sync failed", { description: "Working in Local-Only mode." });
            setUseCloud(false);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleTaskCreated = (newTask: Task) => {
        setTasks((prev) => [newTask, ...prev]);
    };

    const toggleStatus = (id: string) => {
        setTasks((prev) => {
            const taskIndex = prev.findIndex(t => t.id === id);
            if (taskIndex === -1) return prev;

            const task = prev[taskIndex];
            const isMarkingComplete = !task.completed;

            let newTasks = prev.map(t => t.id === id ? { ...t, completed: isMarkingComplete } : t);

            // Handle Recurrence: If marking a recurring task complete, spawn the next one
            if (isMarkingComplete && task.recurrence) {
                const nextDueDate = task.dueDate ? (() => {
                    const date = new Date(task.dueDate);
                    if (task.recurrence === "daily") return addDays(date, 1);
                    if (task.recurrence === "weekly") return addWeeks(date, 1);
                    if (task.recurrence === "monthly") return addMonths(date, 1);
                    return date;
                })().toISOString() : null;

                const nextTask: Task = {
                    ...task,
                    id: uuidv4(),
                    completed: false,
                    dueDate: nextDueDate,
                    createdAt: new Date().toISOString()
                };

                newTasks = [nextTask, ...newTasks];
            }

            return newTasks;
        });
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter(t => t.id !== id));
    };

    const filteredTasks = tasks.filter(task => {
        // AI Search Filter
        if (searchMatchingIds !== null && !searchMatchingIds.includes(task.id)) {
            return false;
        }

        // Manual Filters
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
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 pb-24">

            {/* Premium Header with Sync Status */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-4 shadow-sm border border-purple-200"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Task Manager Pro</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Your Mind. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 font-black">Managed.</span>
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col items-center md:items-end gap-2"
                >
                    <button
                        onClick={syncToCloud}
                        disabled={isSyncing}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold transition-all shadow-md active:scale-95 ${useCloud ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'
                            }`}
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : useCloud ? (
                            <Cloud className="w-4 h-4" />
                        ) : (
                            <CloudOff className="w-4 h-4" />
                        )}
                        <span>{isSyncing ? 'Syncing...' : useCloud ? 'Cloud Synced' : 'Sync to Cloud'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono italic uppercase tracking-widest">Slack & Email Sync Ready</span>
                </motion.div>
            </header>

            {/* Main AI Interaction Area */}
            <section className="space-y-8">
                <div className="space-y-6">
                    <TaskInput onTaskCreated={handleTaskCreated} />

                    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                        <div className="w-full lg:flex-1">
                            <SmartSearch
                                tasks={tasks}
                                onResultsFound={(ids, explanation) => {
                                    setSearchMatchingIds(ids);
                                    setSearchExplanation(explanation);
                                }}
                            />
                        </div>
                        <div className="w-full lg:w-auto">
                            <AISuggestions
                                currentTasks={tasks}
                                onAddSuggestion={handleTaskCreated}
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {searchExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-3xl text-purple-800 text-sm font-medium shadow-sm transition-all"
                        >
                            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-lg ring-4 ring-purple-100">
                                <Wand2 className="w-4 h-4" />
                            </div>
                            <span className="flex-1 italic text-slate-700">"{searchExplanation}"</span>
                            <button
                                onClick={() => {
                                    setSearchMatchingIds(null);
                                    setSearchExplanation(null);
                                }}
                                className="p-2 hover:bg-purple-100 rounded-xl text-purple-400 hover:text-purple-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Controls & List Section */}
            <section className="space-y-6">
                <div className="glass p-3 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center px-6 shadow-sm border border-white/80">

                    <div className="flex gap-4 items-center w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white/50 rounded-xl px-3 py-1.5 border border-slate-200/50">
                            <Filter className="w-4 h-4 text-purple-500" />
                            <select
                                title="Filter by category"
                                className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-slate-700"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as any)}
                            >
                                <option value="all">All Categories</option>
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white/50 rounded-xl px-3 py-1.5 border border-slate-200/50">
                            <select
                                title="Filter by priority"
                                className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-slate-700"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value as any)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High</option>
                                <option value="med">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-white/50 rounded-xl px-3 py-1.5 border border-slate-200/50 w-full sm:w-auto">
                        <SortDesc className="w-4 h-4 text-purple-500" />
                        <select
                            title="Sort tasks"
                            className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-slate-700"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="date">Sort by Date</option>
                            <option value="priority">Sort by Priority</option>
                        </select>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {sortedTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-4 bg-white/30 rounded-3xl border-2 border-dashed border-slate-200"
                            >
                                <BoxSelect className="w-16 h-16 opacity-20" />
                                <p className="font-medium text-lg text-slate-500">Nothing on your list. Catch a breath!</p>
                            </motion.div>
                        ) : (
                            sortedTasks.map((task, index) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    onToggleStatus={toggleStatus}
                                    onDelete={deleteTask}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </section>

        </div>
    );
}
