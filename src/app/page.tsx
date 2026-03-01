import { TaskDashboard } from "@/components/TaskDashboard";

export default function Home() {
  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden blur-[120px] opacity-40 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-purple-600/30 rounded-full mix-blend-screen mix-blend-mode-screen"></div>
        <div className="absolute top-[20%] right-[10%] w-[35rem] h-[35rem] bg-sky-500/30 rounded-full mix-blend-screen mix-blend-mode-screen"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[45rem] h-[45rem] bg-fuchsia-500/30 rounded-full mix-blend-screen mix-blend-mode-screen"></div>
      </div>

      <TaskDashboard />
    </main>
  );
}
