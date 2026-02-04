import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Optimized for Cloudflare deployment and browser security.
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<string> => {
  
  // Strategy 1: If it's a local file upload (base64), go straight to Gemini.
  // This is the fastest and most reliable path.
  if (base64Data && mimeType) {
    return callGeminiAI(base64Data, mimeType);
  }

  // Strategy 2: If it's a URL, try the external Aryan API with a short timeout.
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      const result = await fetchWithTimeout(
        `http://65.109.80.126:20409/aryan/promptv2?imageUrl=${encodeURIComponent(imageUrl)}`,
        {},
        8000 // 8 second timeout
      );
      
      const data = await result.json();
      // Match the structure provided in the Aryan API snippet
      if (data && data.prompt) {
        return data.prompt;
      }
    } catch (e) {
      console.warn("External API blocked or timed out. Falling back to Gemini Engine.");
    }
  }

  // Strategy 3: Universal Fallback - Gemini Vision
  return callGeminiAI(imageUrl, mimeType);
};

/**
 * Helper for timeout-protected fetch
 */
async function fetchWithTimeout(url: string, options: any, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Gemini Pro Vision Implementation
 */
async function callGeminiAI(dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const promptText = "Analyze this image and generate a highly detailed, professional AI art prompt. Focus on: artistic style, lighting, camera settings, and mood. Output ONLY the prompt text.";

    const parts: any[] = [{ text: promptText }];

    if (dataOrUrl.startsWith('data:')) {
      const [header, base64] = dataOrUrl.split(',');
      const detectedMime = mime || header.split(':')[1].split(';')[0];
      parts.push({
        inlineData: {
          data: base64,
          mimeType: detectedMime,
        },
      });
    } else {
      // For remote URLs, Gemini works best if we mention the URL or describe it
      parts[0].text += ` Target Image: ${dataOrUrl}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 } // Flash doesn't need high thinking for prompts
      }
    });

    const result = response.text;
    if (!result) throw new Error("Analysis completed but no text returned.");
    return result.trim();
  } catch (err: any) {
    console.error("Gemini Critical Error:", err);
    throw new Error("The AI processing engine is currently reaching capacity. Please try again in 5 seconds.");
  }
}
