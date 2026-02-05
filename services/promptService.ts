import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Optimized for secure HTTPS environments (Cloudflare/Vercel).
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<string> => {
  // We use Gemini directly because external HTTP APIs are blocked by browsers 
  // on secure hosting providers (Mixed Content policy).
  return callGeminiAI(base64Data || imageUrl, mimeType);
};

/**
 * Gemini 3 Flash Vision Implementation
 * Faster and more reliable for multimodal tasks.
 */
async function callGeminiAI(dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Detailed system-level instruction for the prompt generator
    const instruction = "You are a professional AI prompt engineer. Analyze this image and generate a highly detailed, descriptive art prompt suitable for Midjourney, Stable Diffusion, or DALL-E. Include details about lighting, camera angle, textures, art style, and mood. Provide ONLY the prompt text, no chat or meta-comments.";

    const parts: any[] = [];
    
    // Add text instruction
    parts.push({ text: instruction });

    // Handle local image data (Base64)
    if (dataOrUrl.startsWith('data:')) {
      const splitData = dataOrUrl.split(',');
      const base64Content = splitData[1];
      const detectedMime = mime || splitData[0].split(':')[1].split(';')[0];
      
      parts.push({
        inlineData: {
          data: base64Content,
          mimeType: detectedMime,
        },
      });
    } else if (dataOrUrl.startsWith('http')) {
      // For remote URLs, we attempt to fetch and convert to base64 to ensure the model sees the content.
      // If fetching fails due to CORS, we provide the URL in text as a fallback.
      try {
        const response = await fetch(dataOrUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        const base64Content = await base64Promise;
        
        parts.push({
          inlineData: {
            data: base64Content,
            mimeType: blob.type || 'image/jpeg',
          },
        });
      } catch (err) {
        console.warn("CORS issue fetching remote image, falling back to URL reference.");
        parts[0].text += ` \n[Context: Analyze the image at this URL: ${dataOrUrl}]`;
      }
    } else {
      throw new Error("Invalid image source provided.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
    });

    const result = response.text;
    if (!result) throw new Error("The AI returned an empty response. Try a different image.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Gemini Critical Error:", err);
    throw new Error(err.message || "The visual engine is currently reaching capacity. Please retry shortly.");
  }
}
