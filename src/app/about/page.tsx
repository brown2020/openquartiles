import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — OpenQuartiles",
  description: "How OpenQuartiles works: AI-themed word tiles, local scoring, no accounts.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <article className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="text-sm text-gray-500">
            <Link
              href="/"
              className="underline hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
            >
              ← Back to game
            </Link>
          </p>
          <h1 className="mt-4 text-3xl font-black text-gray-900">About OpenQuartiles</h1>
          <p className="mt-2 text-gray-600">
            A Quartiles-style word puzzle. Reconstruct themed words from scrambled
            tile chunks. No account required.
          </p>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Pick Daily Puzzle or enter a custom theme.</li>
            <li>
              The server generates five 8–12 letter words (OpenAI when{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">OPENAI_API_KEY</code>{" "}
              is set; otherwise a local fallback set).
            </li>
            <li>Select 1–4 tiles, submit words, find all five Quartiles.</li>
            <li>Stats (streak, best score) persist in your browser via localStorage.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Privacy &amp; trust</h2>
          <p className="text-gray-600">
            There is no sign-in. Puzzle generation runs as a Next.js server action;
            the OpenAI key never reaches the browser. Invalid themes are rejected
            server-side. There is no public score-write API — unauthorized{" "}
            <code className="text-sm bg-gray-100 px-1 rounded">/api/*</code>{" "}
            mutations return 404.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Stack</h2>
          <p className="text-gray-600">
            Next.js App Router, React, TypeScript, Tailwind, Zustand, Vercel AI SDK.
          </p>
        </section>
      </article>
    </main>
  );
}
