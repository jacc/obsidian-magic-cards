interface FlashcardPrompt {
  context: string;
  userPrompt: string;
}

interface Flashcard {
  front: string;
  back: string;
}

import OpenAI from "openai";

export async function generateFlashcards(
  settings: {
    apiKey: string;
    apiBaseUrl: string;
    model: string;
  },
  fileContext: string,
  userPrompt: string,
  onCardGenerated: (card: Flashcard) => void
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
  });

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
    console.error("Error during stream processing:", error);
    throw error;
  }
}
