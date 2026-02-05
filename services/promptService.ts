import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Hybrid Engine: Aryan API (Optimized for URL) + Gemini 3 Pro (Vision fallback & Local)
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<{ prompt: string, engine: 'Aryan' | 'Gemini' }> => {
  
  // Strategy 1: Aryan API (From snippet)
  // Only applicable for public remote URLs
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // Increased timeout for external API

      const nix = "http://65.109.80.126:20409/aryan/promptv2";
      const response = await fetch(`${nix}?imageUrl=${encodeURIComponent(imageUrl)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      // Follow the logic in the snippet: check for .prompt or .success
      if (data && (data.prompt || data.success)) {
        return { prompt: data.prompt || "No prompt returned by Aryan Engine.", engine: 'Aryan' };
      }
    } catch (e) {
      console.warn("Aryan Engine offline or blocked by browser security. Falling back to Neural Core...");
    }
  }

  // Strategy 2: Gemini Neural Engine
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 5) {
    throw new Error("AUTH_REQUIRED: System authentication token is missing. Please set process.env.API_KEY or use a managed bridge.");
  }

  // Use Gemini 3 Pro for visual reasoning as per guidelines for complex tasks
  const ai = new GoogleGenAI({ apiKey });
  const prompt = await callGeminiAI(ai, base64Data || imageUrl, mimeType);
  
  return { prompt, engine: 'Gemini' };
};

/**
 * Gemini 3 Pro Vision Implementation
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "You are a professional AI prompt engineer. Analyze this image in extreme detail. Generate a high-fidelity, descriptive art prompt optimized for Midjourney v6 and Stable Diffusion. Focus on: subject matter, lighting, camera settings, textures, mood, and art style. Provide ONLY the prompt text.";

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
      // For URLs, we provide the link as context
      parts[0].text += ` \n[Reference Content: ${dataOrUrl}]`;
    } else {
      throw new Error("Visual data stream is invalid.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded to Pro for better reasoning
      contents: [{ parts }],
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    const result = response.text;
    if (!result) throw new Error("Vision analysis returned an empty result.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Neural Processing Error:", err);
    throw new Error(err.message || "The vision engine encountered a processing fault.");
  }
}
