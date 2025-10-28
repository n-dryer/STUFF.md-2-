import { GoogleGenAI, Type } from '@google/genai';
import { AIResponse } from '../types';

// FIX: Replaced the non-standard `window.ai` implementation with the Google GenAI SDK
// for robust and reliable AI-powered content categorization. This change leverages
// Gemini's JSON mode to ensure structured and predictable responses.
const SYSTEM_INSTRUCTION = `You are an organizational assistant. Your task is to analyze the user's content and respond with a single, valid JSON object.

The JSON object must have the following structure:
{
  "categories": ["string", "string", ...],
  "title": "string",
  "summary": "string",
  "tags": ["string", "string", ...]
}

- "categories": Create a hierarchical path for the note. A single level is preferred unless a deeper hierarchy is obvious (e.g., ["Programming", "JavaScript"]). If unsure, use ["Uncategorized"].
- "title": A concise, context-aware item title reflecting the entry’s core idea. If the content is a URL, this should be a human-readable title for the page.
- "summary": A brief, one or two-sentence summary capturing the key points of the content.
- "tags": Extract 1-5 relevant, concise, organizational tags from the content. Tags must be 1-2 words and non-redundant.

Do not include any other text, markdown formatting, or explanations outside of the JSON object.
`;

// Use hostname to reliably detect development environment.
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const getMockResponse = (): AIResponse => {
  console.log("Using mock AI response for development.");
  return {
    categories: ['Dev', 'Test'],
    tags: ['mock-tag', 'test'],
    title: 'Mock Note Title',
    summary: 'This is a mock summary for development purposes, explaining what the note is about.',
  };
};

export const getCategorization = async (content: string, userPrompt?: string): Promise<AIResponse | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Content to analyze:\n---\n${content}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'A hierarchical path for the note. e.g., ["Programming", "JavaScript"]. If unsure, use ["Uncategorized"].'
            },
            title: {
              type: Type.STRING,
              description: 'A concise title for the content. If it is a URL, this should be the page title.'
            },
            summary: {
              type: Type.STRING,
              description: 'A brief, one or two-sentence summary of the content.'
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '1-5 concise, organizational tags from the content. Tags must be 1-2 words.'
            }
          },
          required: ['categories', 'tags', 'summary', 'title']
        }
      },
    });

    const jsonString = response.text;
    const parsedResponse: AIResponse = JSON.parse(jsonString);

    if (
        !parsedResponse ||
        !Array.isArray(parsedResponse.categories) ||
        !Array.isArray(parsedResponse.tags) ||
        typeof parsedResponse.summary !== 'string' ||
        typeof parsedResponse.title !== 'string'
      ) {
        console.error("Parsed AI response has incorrect schema.", parsedResponse);
        return null;
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error during AI categorization:", error);
    if (isDevelopment) {
      console.log("An error occurred. Falling back to mock AI response for development.");
      return getMockResponse();
    }
    return null;
  }
};