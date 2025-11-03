// Opening information utility with Cloudflare AI integration
import { bookMovesDetector } from './bookMoves';

interface OpeningData {
  name: string;
  eco: string;
  moves: string;
}

class OpeningInfoManager {
  private descriptionCache: Map<string, string> = new Map();
  private loadingPromises: Map<string, Promise<string>> = new Map();
  
  private readonly CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4/accounts/c892995a400da6edb581363bebe64e3b/ai/run/@cf/meta/llama-2-7b-chat-int8';
  private readonly CLOUDFLARE_API_TOKEN = 'aSVdXwLZcF7MMLPopsJ_bnci6RWu5UtfhE3Xe3Ns';

  /**
   * Get opening information for current position
   */
  getOpeningInfo(fen: string): OpeningData | null {
    if (!bookMovesDetector.isLoaded()) {
      return null;
    }

    return bookMovesDetector.getOpeningInfo(fen);
  }

  /**
   * Generate opening description using Cloudflare AI
   */
  async generateDescription(openingName: string, eco: string): Promise<string> {
    // Check cache first
    const cacheKey = `${eco}:${openingName}`;
    if (this.descriptionCache.has(cacheKey)) {
      return this.descriptionCache.get(cacheKey)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Create loading promise
    const promise = this.fetchDescription(openingName, eco);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const description = await promise;
      this.descriptionCache.set(cacheKey, description);
      return description;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Fetch description from Cloudflare AI API
   */
  private async fetchDescription(openingName: string, eco: string): Promise<string> {
    try {
      const prompt = `You are a chess opening expert. Provide a brief, accurate 2-3 sentence description of the ${openingName} (ECO: ${eco}) opening. Include: 1) Key characteristic of the opening, 2) Main strategic idea, 3) Typical move order or notable variation. Be concise and informative. Do not include the opening name or ECO code in your response.`;

      const response = await fetch(this.CLOUDFLARE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`Cloudflare API error: ${response.status} ${response.statusText}`);
        // Return a default message if API fails
        return `${openingName} (ECO: ${eco}) - A classical chess opening with rich strategic content.`;
      }

      const data = await response.json() as { result?: { response?: string } };
      
      if (data.result?.response) {
        return data.result.response.trim();
      }

      return `${openingName} (ECO: ${eco}) - A classical chess opening with rich strategic content.`;
    } catch (error) {
      console.error('Failed to fetch opening description:', error);
      return `${openingName} (ECO: ${eco}) - A classical chess opening with rich strategic content.`;
    }
  }

  /**
   * Check if description is cached
   */
  isCached(eco: string, openingName: string): boolean {
    const cacheKey = `${eco}:${openingName}`;
    return this.descriptionCache.has(cacheKey);
  }
}

export const openingInfoManager = new OpeningInfoManager();
