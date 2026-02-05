import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Hybrid Engine: Uses Aryan API for remote URLs and Gemini for local assets.
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<string> => {
  
  // Strategy 1: Remote URL (Try the Aryan API from your snippet first)
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      // Note: This may be blocked on HTTPS sites (Mixed Content). 
      // We wrap it in a timeout and try/catch to ensure fallback.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`http://65.109.80.126:20409/aryan/promptv2?imageUrl=${encodeURIComponent(imageUrl)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data && data.prompt) {
        return data.prompt;
      }
    } catch (e) {
      console.warn("Aryan API unreachable or blocked. Redirecting to Gemini Neural Engine...");
    }
  }

  // Strategy 2: Tech Master Gemini Engine (For local uploads or URL fallback)
  const apiKey = process.env.API_KEY;
  
  // CRITICAL: Prevent the "API Key must be set" SDK error
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("ENGINE_OFFLINE: API Key not detected. Please use the 'Connect API Project' button.");
  }

  const ai = new GoogleGenAI({ apiKey });
  return callGeminiAI(ai, base64Data || imageUrl, mimeType);
};

/**
 * Gemini 3 Flash Vision Implementation
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "Act as a world-class prompt engineer. Analyze the provided image in extreme detail. Generate a rich, descriptive prompt optimized for Midjourney v6 and DALL-E 3. Include subject, lighting, camera settings, and textures. Output ONLY the prompt string.";

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
    } else {
      // Fallback for URLs if direct analysis is needed
      parts[0].text += ` \n[Context: Analyze this image: ${dataOrUrl}]`;
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
    if (!result) throw new Error("Visual signal analyzed but output was void.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Neural Engine Fault:", err);
    throw new Error(err.message || "The visual analysis engine encountered a structural fault.");
  }
}
