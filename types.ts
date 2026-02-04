
export interface PromptHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
}

export interface PromptApiResponse {
  status: boolean;
  prompt?: string;
  error?: string;
  message?: string;
}

export type Theme = 'light' | 'dark';
