// app/page.tsx
import GameArea from "@/components/game/GameArea";

/** Covers two timed model attempts plus overhead before the platform kills the action. */
export const maxDuration = 30;

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <GameArea />
    </main>
  );
}
