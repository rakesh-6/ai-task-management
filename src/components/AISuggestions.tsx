"use client";

import { useState } from "react";
import { Sparkles, Plus, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface Suggestion {
    title: string;
    reason: string;
    category: "work" | "personal";
    priority: "low" | "med" | "high";
}

interface AISuggestionsProps {
    currentTasks: Task[];
    onAddSuggestion: (task: Task) => void;
}

export function AISuggestions({ currentTasks, onAddSuggestion }: AISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tasks: currentTasks }),
            });
            if (!res.ok) throw new Error("Failed to fetch suggestions");
            const data = await res.json();
            setSuggestions(data);
            setIsOpen(true);
        } catch (error) {
            toast.error("Could not get suggestions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (s: Suggestion) => {
        const newTask: Task = {
            id: uuidv4(),
            title: s.title,
            category: s.category,
            priority: s.priority,
            dueDate: null,
            completed: false,
            createdAt: new Date().toISOString(),
        };
        onAddSuggestion(newTask);
        setSuggestions(prev => prev.filter(item => item.title !== s.title));
        toast.success("Added suggestion!");
    };

    return (
        <div className="space-y-4">
            <button
                onClick={fetchSuggestions}
                disabled={isLoading}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
            >
                {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                )}
                <span>What should I do next?</span>
            </button>

            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass p-6 rounded-3xl border border-purple-200/50 space-y-4 shadow-xl">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    AI Recommendations
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {suggestions.map((s, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative group p-4 bg-white/60 rounded-2xl border border-slate-200/50 hover:border-purple-300 transition-all hover:shadow-lg"
                                    >
                                        <div className="space-y-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.category === 'work' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {s.category}
                                            </span>
                                            <h4 className="font-bold text-slate-800 leading-snug">{s.title}</h4>
                                            <p className="text-xs text-slate-500 italic pb-8">"{s.reason}"</p>
                                        </div>

                                        <button
                                            onClick={() => handleAdd(s)}
                                            className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
