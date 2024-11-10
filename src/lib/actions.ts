// lib/actions.ts
"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { GameWords } from "./types";

export async function getThemeWords(theme: string): Promise<GameWords> {
  try {
    const openai = createOpenAI();
    const model = openai("gpt-4o");

    // Simplified prompt to be more direct
    const { text } = await generateText({
      model,
      system: `You are a word game assistant. Generate exactly 5 themed words, each 10-14 letters long, 
split into 4 meaningful chunks. Return only a JSON object, no other text.`,
      prompt: `Theme: "${theme}"
Format your response exactly like this, with 5 words:
{
  "theme": "${theme}",
  "words": [
    {
      "word": "BASKETBALL",
      "chunks": ["BAS", "KET", "BA", "LL"]
    }
  ]
}

Requirements:
- Each word must be 10-14 letters
- Each word must be split into exactly 4 chunks
- Each chunk must be 2+ letters (except vowels)
- Words must be related to the theme
- Return only the JSON, no other text`,
    });

    // Log the raw response for debugging
    console.log("Raw AI Response:", text);

    // Clean the response
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    console.log("Cleaned Response:", cleanText);

    try {
      // Try to parse the JSON
      const data = JSON.parse(cleanText) as GameWords;

      // Validate the basic structure
      if (!data || typeof data !== "object") {
        throw new Error("Response is not an object");
      }

      if (!data.theme || !Array.isArray(data.words)) {
        throw new Error("Missing theme or words array");
      }

      // Validate word count
      if (data.words.length !== 5) {
        throw new Error(`Expected 5 words, got ${data.words.length}`);
      }

      // Validate each word
      data.words.forEach((wordData, index) => {
        if (!wordData.word || !Array.isArray(wordData.chunks)) {
          throw new Error(`Invalid word data at position ${index}`);
        }

        if (wordData.word.length < 10 || wordData.word.length > 14) {
          throw new Error(`Word "${wordData.word}" must be 10-14 letters`);
        }

        if (wordData.chunks.length !== 4) {
          throw new Error(`Word "${wordData.word}" must have exactly 4 chunks`);
        }

        const reconstructed = wordData.chunks.join("");
        if (reconstructed !== wordData.word) {
          throw new Error(`Chunks don't reconstruct word "${wordData.word}"`);
        }
      });

      return data;
    } catch (parseError) {
      console.error("Parse Error Details:", {
        error: parseError,
        rawText: text,
        cleanText: cleanText,
      });
      throw new Error(
        `Failed to process response: ${
          parseError instanceof Error ? parseError.message : "Invalid format"
        }`
      );
    }
  } catch (error) {
    console.error("GetThemeWords Error:", {
      error,
      theme,
      timestamp: new Date().toISOString(),
    });

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Failed to process response")) {
        throw new Error(
          "Unable to generate valid words. Please try a different theme."
        );
      } else if (error.message.includes("Missing theme")) {
        throw new Error("Invalid response format. Please try again.");
      } else if (error.message.includes("must be 10-14 letters")) {
        throw new Error("Generated words were invalid. Please try again.");
      }
    }

    throw new Error("Failed to generate words. Please try another theme.");
  }
}
