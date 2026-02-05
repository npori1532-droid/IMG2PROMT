import { GoogleGenAI } from "@google/genai";

/**
 * Visual Intelligence Service
 * Optimized for secure production environments.
 */
export const fetchPromptFromImage = async (
  imageUrl: string, 
  base64Data?: string, 
  mimeType?: string
): Promise<string> => {
  // Always initialize a fresh instance to capture the latest API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return callGeminiAI(ai, base64Data || imageUrl, mimeType);
};

/**
 * Gemini 3 Flash Vision Implementation
 * Optimized for speed and complex descriptive analysis.
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "Act as a world-class prompt engineer. Analyze the provided image in extreme detail. Generate a rich, descriptive prompt optimized for Midjourney v6 and DALL-E 3. Include information on subject, composition, lighting, camera settings, and textures. Output ONLY the prompt string.";

    const parts: any[] = [{ text: instruction }];

    // Prepare image payload
    if (dataOrUrl.startsWith('data:')) {
      const base64Content = dataOrUrl.split(',')[1];
      const detectedMime = mime || dataOrUrl.split(':')[1].split(';')[0];
      
      parts.push({
        inlineData: {
          data: base64Content,
          mimeType: detectedMime,
        },
      });
    } else if (dataOrUrl.startsWith('http')) {
      // For URLs, we attempt a fetch to provide raw bits to the model for better accuracy
      try {
        const response = await fetch(dataOrUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        
        parts.push({
          inlineData: {
            data: base64,
            mimeType: blob.type || 'image/jpeg',
          },
        });
      } catch (err) {
        // Fallback to text reference if fetch fails
        parts[0].text += ` \n[Reference URL: ${dataOrUrl}]`;
      }
    } else {
      throw new Error("Invalid resource path.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    const result = response.text;
    if (!result) throw new Error("Processing complete but analysis was inconclusive.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Gemini Vision Error:", err);
    
    // Pass through specific error messages for better user feedback
    if (err.message?.includes('API key')) {
      throw new Error("API Authentication Failure. Please verify your system credentials.");
    }
    
    throw new Error(err.message || "Visual analysis engine timed out. Please try again.");
  }
}
