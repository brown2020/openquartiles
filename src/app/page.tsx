// app/page.tsx

import GameArea from "@/components/game/GameArea";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Quartiles</h1>
      <GameArea />
    </main>
  );
}
