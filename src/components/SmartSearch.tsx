"use client";

import { useState } from "react";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { toast } from "sonner";

interface SmartSearchProps {
    tasks: Task[];
    onResultsFound: (matchingIds: string[] | null, explanation: string | null) => void;
}

export function SmartSearch({ tasks, onResultsFound }: SmartSearchProps) {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [hasActiveSearch, setHasActiveSearch] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isSearching) return;

        setIsSearching(true);
        try {
            const res = await fetch("/api/query-tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, tasks }),
            });

            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();

            onResultsFound(data.filteredTaskIds, data.explanation);
            setHasActiveSearch(true);
            toast.success("Filtered by AI");
        } catch (error) {
            toast.error("AI Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setHasActiveSearch(false);
        onResultsFound(null, null);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask AI to filter... (e.g., 'Work tasks due this week')"
                    className="w-full pl-12 pr-12 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all text-slate-800 placeholder:text-slate-400 font-medium shadow-sm"
                />

                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                    {hasActiveSearch && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!query.trim() || isSearching}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors disabled:opacity-30"
                        title="AI Search"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
