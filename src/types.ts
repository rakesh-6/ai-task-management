export type TaskCategory = "work" | "personal";
export type TaskPriority = "low" | "med" | "high";
export type TaskRecurrence = "daily" | "weekly" | "monthly";

export interface Task {
    id: string;
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    completed: boolean;
    recurrence?: TaskRecurrence;
}
