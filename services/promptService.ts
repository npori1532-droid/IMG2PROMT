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
  
  // Strategy 1: Aryan API (From snippet)
  // Only applicable for public remote URLs. This is prioritized to avoid API key requirements for web links.
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const nix = "http://65.109.80.126:20409/aryan/promptv2";
      const response = await fetch(`${nix}?imageUrl=${encodeURIComponent(imageUrl)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data && (data.prompt || data.success)) {
        return { prompt: data.prompt || "No prompt returned by Aryan Engine.", engine: 'Aryan' };
      }
    } catch (e) {
      console.warn("Aryan Engine unreachable (likely Mixed Content blocked). Falling back to secure Neural Core...");
      // If we are on HTTPS and trying to hit an HTTP endpoint, it usually fails.
      // We don't throw yet, we try Gemini next.
    }
  }

  // Strategy 2: Gemini Neural Engine
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.length < 5) {
    if (imageUrl.startsWith('data:')) {
      throw new Error("AUTH_REQUIRED: Local file analysis requires a Tech Master Neural Engine key. Please connect your API project.");
    } else {
      throw new Error("AUTH_REQUIRED: Both engines failed to process this link. Please ensure your API key is set in the host environment.");
    }
  }

  // Use Gemini 3 Flash for fast, efficient visual reasoning
  const ai = new GoogleGenAI({ apiKey });
  const prompt = await callGeminiAI(ai, base64Data || imageUrl, mimeType);
  
  return { prompt, engine: 'Gemini' };
};

/**
 * Gemini 3 Flash Vision Implementation
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
      parts[0].text += ` \n[Analyze this reference content: ${dataOrUrl}]`;
    } else {
      throw new Error("Invalid visual data stream.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
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
