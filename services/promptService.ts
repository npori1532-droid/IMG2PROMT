import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Optimized Hybrid Engine: Aryan API (Primary for URL) + Gemini (Vision fallback & Local)
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<{ prompt: string, engine: 'Aryan' | 'Gemini' }> => {
  
  // Strategy 1: Aryan API (From snippet) - Only for remote URLs
  // Note: Modern browsers block http calls from https sites (Mixed Content).
  // We try this first but catch failure to fallback to secure Gemini.
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`http://65.109.80.126:20409/aryan/promptv2?imageUrl=${encodeURIComponent(imageUrl)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data && data.prompt) {
        return { prompt: data.prompt, engine: 'Aryan' };
      }
    } catch (e) {
      console.warn("Aryan API (HTTP) blocked or unreachable. Falling back to secure Neural Engine.");
    }
  }

  // Strategy 2: Gemini Neural Engine
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 5) {
    throw new Error("AUTH_REQUIRED: System authentication token is missing or invalid.");
  }

  // Always create new instance as per instructions
  const ai = new GoogleGenAI({ apiKey });
  const prompt = await callGeminiAI(ai, base64Data || imageUrl, mimeType);
  
  return { prompt, engine: 'Gemini' };
};

/**
 * Gemini 3 Flash Vision Implementation
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "You are a professional AI prompt engineer. Analyze this image in extreme detail. Generate a high-fidelity, descriptive art prompt optimized for Midjourney v6 and Stable Diffusion. Focus on: lighting, camera angle, textures, mood, and style. Provide ONLY the prompt text, no metadata.";

    const parts: any[] = [{ text: instruction }];

    if (dataOrUrl.startsWith('data:')) {
      const split = dataOrUrl.split(',');
      const base64Content = split[1];
      const detectedMime = mime || split[0].split(':')[1].split(';')[0];
      
      parts.push({
        inlineData: {
          data: base64Content,
          mimeType: detectedMime,
        },
      });
    } else if (dataOrUrl.startsWith('http')) {
      // For URLs, we provide the link as context for the vision model
      parts[0].text += ` \n[Reference Target: ${dataOrUrl}]`;
    } else {
      throw new Error("Target data stream is corrupted or unrecognizable.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        temperature: 0.85,
        topP: 0.95,
      }
    });

    const result = response.text;
    if (!result) throw new Error("Vision analysis returned a null pointer.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Neural Processing Error:", err);
    throw new Error(err.message || "The vision engine encountered a critical processing fault.");
  }
}
