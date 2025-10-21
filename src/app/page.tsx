import { PlayerDashboard } from "@/components/player-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <PlayerDashboard />
      </div>
    </main>
  );
}
