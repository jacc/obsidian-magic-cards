interface FlashcardPrompt {
  context: string;
  userPrompt: string;
}

interface Flashcard {
  front: string;
  back: string;
  tokenCount?: number;
}

import OpenAI from "openai";

// this is a rough approx
function estimateTokenCount(text: string): number {
  // split on spaces and punctuation
  const words = text.split(/[\s,.!?;:'"()\[\]{}|\/\\]+/);
  // filter out empty strings and multiply by 1.3 for a rough token estimate
  return Math.ceil(words.filter(word => word.length > 0).length * 1.3);
}

export async function generateFlashcards(
  settings: {
    apiKey: string;
    apiBaseUrl: string;
    model: string;
  },
  fileContext: string,
  userPrompt: string,
  onCardGenerated: (card: Flashcard) => void,
  signal?: AbortSignal,
): Promise<void> {
  const openai = new OpenAI({
    baseURL: settings.apiBaseUrl,
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const stream = await openai.chat.completions.create({
    model: settings.model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that creates educational flashcards based on provided content. Output each flashcard as a JSON object with 'front' and 'back' fields.",
      },
      {
        role: "user",
        content: `Please create flashcards based on the following context and user requirements:

        Context from file:
        ${fileContext}

        User requirements:
        ${userPrompt}`,
      },
    ],
    stream: true,
  }, { signal });

  let accumulatedContent = "";

  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        accumulatedContent += content;

        // Try to find complete JSON objects in accumulated content
        const matches = accumulatedContent.match(/\{[^{}]*\}/g);
        if (matches) {
          for (const match of matches) {
            try {
              const flashcard = JSON.parse(match);
              if (flashcard.front && flashcard.back) {
                flashcard.tokenCount = estimateTokenCount(flashcard.front + flashcard.back);
                onCardGenerated(flashcard);
                // Remove the processed JSON from accumulated content
                accumulatedContent = accumulatedContent.replace(match, "");
              }
            } catch (e) {
              // Not a valid flashcard JSON, continue
            }
          }
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      console.log("Request was aborted");
      return;
    }
    console.error("Error during stream processing:", error);
    throw error;
  }
}