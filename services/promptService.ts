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
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Authentication link severed. Please re-initialize the engine.");
  }

  // Always initialize a fresh instance to capture the latest API Key
  const ai = new GoogleGenAI({ apiKey });
  return callGeminiAI(ai, base64Data || imageUrl, mimeType);
};

/**
 * Gemini 3 Flash Vision Implementation
 * Optimized for speed and complex descriptive analysis.
 */
async function callGeminiAI(ai: GoogleGenAI, dataOrUrl: string, mime?: string): Promise<string> {
  try {
    const instruction = "Act as a world-class prompt engineer. Analyze the provided image in extreme detail. Generate a rich, descriptive prompt optimized for Midjourney v6 and DALL-E 3. Include information on subject, composition, lighting, camera settings, and textures. Output ONLY the prompt string. Be creative and artistic.";

    const parts: any[] = [{ text: instruction }];

    // Prepare image payload
    if (dataOrUrl.startsWith('data:')) {
      const split = dataOrUrl.split(',');
      if (split.length < 2) throw new Error("Malformed image data detected.");
      
      const base64Content = split[1];
      const detectedMime = mime || split[0].split(':')[1].split(';')[0];
      
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
        if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
        
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        parts.push({
          inlineData: {
            data: base64,
            mimeType: blob.type || 'image/jpeg',
          },
        });
      } catch (err) {
        // Fallback to text reference if fetch fails (e.g. CORS)
        parts[0].text += ` \n[Context: Analyze the image located at this public URL: ${dataOrUrl}]`;
      }
    } else {
      throw new Error("The provided image resource path is unrecognizable.");
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
    if (!result) throw new Error("Visual signal received but analysis was inconclusive.");
    
    return result.trim();
  } catch (err: any) {
    console.error("Gemini Vision Fault:", err);
    
    // Pass through specific error messages for better user feedback
    const msg = err.message || "";
    if (msg.includes('API key') || msg.includes('entity was not found')) {
      throw new Error("API Authentication Failure. Please verify your system credentials.");
    }
    
    if (msg.includes('quota') || msg.includes('429')) {
      throw new Error("Engine rate limit exceeded. Please wait 60 seconds.");
    }
    
    throw new Error(err.message || "Visual analysis engine timed out. Please try a different asset.");
  }
}
