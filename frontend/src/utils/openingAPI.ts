// Opening API utility - fetches from backend SQLite database

// Determine API base URL based on current location
// This function is called dynamically to ensure window is available
const getAPIBase = () => {
  // Always use localhost:3001 for backend API in development
  // In production, the backend should be on port 3001 or use environment variables
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    
    // Development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production environment - backend typically runs on a different port or subdomain
    // Check if there's a custom backend URL in environment
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Default: assume backend is on same host but port 3001
    return `${window.location.protocol}//${hostname}:3001`;
  }
  
  // Fallback for SSR or non-browser environment
  return 'http://localhost:3001';
};

interface OpeningData {
  id?: number;
  name: string;
  eco: string;
  category?: string;
  description?: string;
}

class OpeningAPIManager {
  private cache: Map<string, OpeningData> = new Map();
  private loadingPromises: Map<string, Promise<OpeningData | null>> = new Map();

  /**
   * Get the API base URL dynamically
   */
  private getAPIBase(): string {
    return getAPIBase();
  }

  /**
   * Get opening by name
   */
  async getOpeningByName(name: string): Promise<OpeningData | null> {
    if (!name) return null;

    // Check cache first
    const cacheKey = `name:${name}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey) || null;
    }

    // Create loading promise
    const promise = this.fetchFromAPI(`/api/openings/by-name/${encodeURIComponent(name)}`);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const result = await promise;
      if (result) {
        this.cache.set(cacheKey, result);
      }
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Search openings by query
   */
  async searchOpenings(query: string): Promise<OpeningData[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const apiBase = this.getAPIBase();
      const response = await fetch(`${apiBase}/api/openings/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search openings');
      }
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text.substring(0, 200));
        throw new Error('API returned non-JSON response (possibly HTML error page)');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to search openings:', error);
      return [];
    }
  }

  /**
   * Get all openings with pagination
   */
  async listOpenings(category?: string, limit: number = 100, offset: number = 0): Promise<OpeningData[]> {
    try {
      const apiBase = this.getAPIBase();
      let url = `${apiBase}/api/openings/list?limit=${limit}&offset=${offset}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to list openings');
      }
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text.substring(0, 200));
        throw new Error('API returned non-JSON response (possibly HTML error page)');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to list openings:', error);
      return [];
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const apiBase = this.getAPIBase();
      const response = await fetch(`${apiBase}/api/openings/categories`);
      if (!response.ok) {
        throw new Error('Failed to get categories');
      }
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text.substring(0, 200));
        throw new Error('API returned non-JSON response (possibly HTML error page)');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  /**
   * Private method to fetch from API
   */
  private async fetchFromAPI(endpoint: string): Promise<OpeningData | null> {
    try {
      const apiBase = this.getAPIBase();
      const url = `${apiBase}${endpoint}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, read as text to see what we got
        const text = await response.text();
        console.error('API returned non-JSON response:', text.substring(0, 200));
        console.error('Request URL was:', url);
        throw new Error('API returned non-JSON response (possibly HTML error page)');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const openingAPIManager = new OpeningAPIManager();
