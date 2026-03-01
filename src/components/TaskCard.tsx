import { format, addDays, addWeeks, addMonths } from "date-fns";
import { Calendar, Briefcase, User, AlertCircle, CheckCircle2, Circle, Repeat } from "lucide-react";
import { type Task } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TaskCardProps {
    task: Task;
    index?: number;
    onToggleStatus?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TaskCard({ task, index = 0, onToggleStatus, onDelete }: TaskCardProps) {
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && !task.completed : false;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1,
                duration: 0.8,
                delay: index * 0.05
            }}
            whileHover={{ y: -5, scale: 1.01 }}
            className={cn(
                "glass premium-card group relative overflow-hidden rounded-2xl p-6",
                task.completed && "opacity-60 grayscale-[0.2]"
            )}
        >
            {/* Dynamic top gradient line based on priority */}
            <div
                className={cn(
                    "absolute top-0 left-0 h-1.5 w-full",
                    task.priority === "high" && "bg-gradient-to-r from-red-500 to-rose-400",
                    task.priority === "med" && "bg-gradient-to-r from-amber-500 to-orange-400",
                    task.priority === "low" && "bg-gradient-to-r from-emerald-500 to-teal-400",
                )}
            />

            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggleStatus?.(task.id)}
                    className="mt-1 flex-shrink-0 text-slate-400 hover:text-purple-600 transition-colors"
                >
                    {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                        <Circle className="w-6 h-6" />
                    )}
                </button>

                <div className="flex-1 space-y-2">
                    <h3 className={cn(
                        "text-lg font-medium tracking-tight text-slate-800",
                        task.completed && "line-through text-slate-500"
                    )}>
                        {task.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                        {/* Category badge */}
                        <span className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/40 border border-slate-200/50 shadow-sm",
                            task.category === "work" ? "text-blue-600" : "text-purple-600"
                        )}>
                            {task.category === "work" ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            <span className="capitalize">{task.category}</span>
                        </span>

                        {/* Priority badge */}
                        <span className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/40 border border-slate-200/50 shadow-sm capitalize",
                            task.priority === "high" && "text-red-600",
                            task.priority === "med" && "text-amber-600",
                            task.priority === "low" && "text-emerald-600"
                        )}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {task.priority}
                        </span>

                        {/* Recurrence badge */}
                        {task.recurrence && (
                            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/40 border border-slate-200/50 shadow-sm text-purple-600">
                                <Repeat className="w-3.5 h-3.5" />
                                <span className="capitalize">{task.recurrence}</span>
                            </span>
                        )}

                        {/* Due date badge */}
                        {task.dueDate && (
                            <span className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/40 border shadow-sm",
                                isOverdue ? "text-red-600 border-red-200 bg-red-50" : "text-slate-600 border-slate-200/50"
                            )}>
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Delete button (visible on hover) */}
                {onDelete && (
                    <button
                        onClick={() => onDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-xl hover:bg-slate-100/50"
                        aria-label="Delete task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                )}
            </div>
        </motion.div>
    );
}
