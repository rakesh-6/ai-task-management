import { format } from "date-fns";
import { Calendar, Briefcase, User, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { type Task } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TaskCardProps {
    task: Task;
    onToggleStatus?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TaskCard({ task, onToggleStatus, onDelete }: TaskCardProps) {
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && !task.completed : false;

    return (
        <div
            className={cn(
                "glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20",
                task.completed && "opacity-60 grayscale-[0.5]"
            )}
        >
            {/* Dynamic top gradient line based on priority */}
            <div
                className={cn(
                    "absolute top-0 left-0 h-1 w-full",
                    task.priority === "high" && "bg-gradient-to-r from-red-500 to-rose-400",
                    task.priority === "med" && "bg-gradient-to-r from-amber-500 to-orange-400",
                    task.priority === "low" && "bg-gradient-to-r from-emerald-500 to-teal-400",
                )}
            />

            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggleStatus?.(task.id)}
                    className="mt-1 flex-shrink-0 text-slate-400 hover:text-purple-400 transition-colors"
                >
                    {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                        <Circle className="w-6 h-6" />
                    )}
                </button>

                <div className="flex-1 space-y-2">
                    <h3 className={cn(
                        "text-lg font-medium tracking-tight text-white",
                        task.completed && "line-through text-slate-300"
                    )}>
                        {task.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                        {/* Category badge */}
                        <span className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-slate-200 bg-white/5 border border-white/10",
                            task.category === "work" ? "text-blue-300" : "text-purple-300"
                        )}>
                            {task.category === "work" ? <Briefcase className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            <span className="capitalize">{task.category}</span>
                        </span>

                        {/* Priority badge */}
                        <span className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/5 border border-white/10 capitalize",
                            task.priority === "high" && "text-red-300",
                            task.priority === "med" && "text-amber-300",
                            task.priority === "low" && "text-emerald-300"
                        )}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {task.priority} Priority
                        </span>

                        {/* Due date badge */}
                        {task.dueDate && (
                            <span className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/5 border border-white/10",
                                isOverdue ? "text-red-400 border-red-500/30" : "text-slate-300"
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
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-400 transition-all rounded-xl hover:bg-white/5"
                        aria-label="Delete task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}
