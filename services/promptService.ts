import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Hybrid Engine: Aryan API (Primary for URL) + Gemini 3 Flash (Vision fallback & Local)
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<{ prompt: string, engine: 'Aryan' | 'Gemini' }> => {
  
  // Strategy 1: Aryan API
  // Prioritized for public URLs to bypass local Gemini API key requirements.
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // We use the exact endpoint provided by the user
      const endpoint = "http://65.109.80.126:20409/aryan/promptv2";
      const response = await fetch(`${endpoint}?imageUrl=${encodeURIComponent(imageUrl)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && (data.prompt || data.success)) {
          return { prompt: data.prompt || "No descriptive text returned.", engine: 'Aryan' };
        }
      }
    } catch (e) {
      console.warn("Aryan Engine offline or blocked by HTTPS policy. Attempting Gemini fallback...");
    }
  }

  // Strategy 2: Gemini Neural Engine
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 5) {
    if (imageUrl.startsWith('data:')) {
      throw new Error("AUTH_REQUIRED_LOCAL");
    } else {
      throw new Error("AUTH_REQUIRED_REMOTE");
    }
  }

  // Initialize SDK only when we have a valid key to avoid browser-level init errors
  const ai = new GoogleGenAI({ apiKey });
  const prompt = await callGeminiAI(ai, base64Data || imageUrl, mimeType);
  
  return { prompt, engine: 'Gemini' };
};

/**
 * Gemini 3 Flash Vision Implementation
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "You are an expert AI prompt engineer. Analyze this image thoroughly. Generate a high-fidelity art prompt for Midjourney v6. Describe colors, composition, lighting, style, and camera details. Output ONLY the prompt text.";

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
      // For URLs, we use text prompting referencing the image
      parts[0].text += ` \n[Analyze this reference image: ${dataOrUrl}]`;
    } else {
      throw new Error("Invalid visual stream.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: [{ parts }],
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    const result = response.text;
    if (!result) throw new Error("Null pointer returned from analysis.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Neural Analysis Error:", err);
    throw new Error(err.message || "Visual analysis engine failure.");
  }
}
