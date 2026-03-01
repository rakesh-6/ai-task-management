import { TaskDashboard } from "@/components/TaskDashboard";

export default function Home() {
  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <TaskDashboard />
    </main>
  );
}
