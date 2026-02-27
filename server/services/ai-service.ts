import { MessageRole } from '../../src/types';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface AIModelConfig {
  provider: 'openrouter' | 'huggingface' | 'gemini';
  modelId: string;
}

export interface AIService {
  streamResponse(
    messages: ChatMessage[],
    modelId: string,
    onChunk: (chunk: string) => void,
    onError: (error: any) => void
  ): Promise<void>;
}

class OpenRouterService implements AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async streamResponse(
    messages: ChatMessage[],
    modelId: string,
    onChunk: (chunk: string) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'TeleGen AI',
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenRouter API error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Failed to get response reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) onChunk(content);
            } catch (e) {
              console.error('Error parsing OpenRouter chunk', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }
}

class HuggingFaceService implements AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async streamResponse(
    messages: ChatMessage[],
    modelId: string,
    onChunk: (chunk: string) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      // Hugging Face Inference API (v2) supports streaming for some models
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: true,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Hugging Face API error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Failed to get response reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) onChunk(content);
            } catch (e) {
              // Some HF models might return different formats
              console.error('Error parsing HuggingFace chunk', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }
}

export class AIServiceFactory {
  static getService(provider: string): AIService {
    switch (provider) {
      case 'openrouter':
        if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set');
        return new OpenRouterService(process.env.OPENROUTER_API_KEY);
      case 'huggingface':
        if (!process.env.HUGGINGFACE_API_KEY) throw new Error('HUGGINGFACE_API_KEY not set');
        return new HuggingFaceService(process.env.HUGGINGFACE_API_KEY);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
