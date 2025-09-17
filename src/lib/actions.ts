// lib/actions.ts
"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { GameWords } from "./types";

// Maximum number of retries when word validation fails
const MAX_RETRIES = 3;

export async function getThemeWords(theme: string): Promise<GameWords> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const openai = createOpenAI();
      const model = openai("gpt-4.1");

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
      "chunks": ["BAS", "KET", "BALL"]
    },
    {
      "word": "QUARTERBACK",
      "chunks": ["QUAR", "TER", "BA", "CK"]
    }
  ]
}

EXTREMELY IMPORTANT REQUIREMENTS:
- Each word MUST be 10-14 letters EXACTLY (count carefully)
- Each word must be split into exactly 4 chunks
- EVERY chunk MUST be at least 2 letters long - NO single-letter chunks allowed (avoid "A" or "I" as chunks)
- Chunks should be balanced in length - aim for chunks of similar size (2-3 letters each)
- Good examples: "STRAWBERRY" → ["STRAW", "BER", "RY"] NOT ["S", "TRAW", "BERRY"]
- Good example: "CARAMELIZED" → ["CAR", "AM", "EL", "IZED"] NOT ["CAR", "A", "MEL", "IZED"]
- Try to create meaningful syllables or word parts when splitting
- Words must be related to the theme
- Return only the JSON, no other text
- Do not include any word less than 10 letters or more than 14 letters`,
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
            throw new Error(
              `Word "${wordData.word}" must have exactly 4 chunks`
            );
          }

          // Validate all chunks are at least 2 letters
          const hasShortChunk = wordData.chunks.some(
            (chunk) => chunk.length < 2
          );
          if (hasShortChunk) {
            throw new Error(
              `Word "${wordData.word}" has chunks shorter than 2 letters`
            );
          }

          const reconstructed = wordData.chunks.join("");
          if (reconstructed !== wordData.word) {
            throw new Error(`Chunks don't reconstruct word "${wordData.word}"`);
          }

          // Check if all 4 chunks are present
          if (wordData.chunks.length !== 4) {
            throw new Error(
              `Word "${wordData.word}" must have exactly 4 chunks, found ${wordData.chunks.length}`
            );
          }
        });

        return data;
      } catch (parseError) {
        console.error("Parse Error Details:", {
          error: parseError,
          rawText: text,
          cleanText: cleanText,
        });

        // If this is due to invalid word length or chunk length, try again
        if (
          parseError instanceof Error &&
          (parseError.message.includes("must be 10-14 letters") ||
            parseError.message.includes("has chunks shorter than 2 letters") ||
            parseError.message.includes("must have exactly 4 chunks"))
        ) {
          retries++;
          console.log(
            `Validation failed. Retrying (${retries}/${MAX_RETRIES})...`
          );
          continue; // Try again
        }

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
        retryAttempt: retries,
      });

      // If we still have retries and this is a validation error, try again
      if (
        retries < MAX_RETRIES &&
        error instanceof Error &&
        (error.message.includes("must be 10-14 letters") ||
          error.message.includes("has chunks shorter than 2 letters") ||
          error.message.includes("must have exactly 4 chunks") ||
          error.message.includes("Failed to process response"))
      ) {
        retries++;
        console.log(`Error occurred. Retrying (${retries}/${MAX_RETRIES})...`);
        continue; // Try again
      }

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to process response")) {
          throw new Error(
            "Unable to generate valid words. Please try a different theme."
          );
        } else if (error.message.includes("Missing theme")) {
          throw new Error("Invalid response format. Please try again.");
        } else if (
          error.message.includes("must be 10-14 letters") ||
          error.message.includes("has chunks shorter than 2 letters") ||
          error.message.includes("must have exactly 4 chunks")
        ) {
          throw new Error("Generated words were invalid. Please try again.");
        }
      }

      throw new Error("Failed to generate words. Please try another theme.");
    }
  }

  // If we exhausted all retries
  throw new Error(
    "Unable to generate valid words after multiple attempts. Please try a different theme."
  );
}
