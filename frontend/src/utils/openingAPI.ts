// Opening API utility - fetches from backend SQLite database

// Determine API base URL based on current location
const getAPIBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    // In development, use localhost:3001
    // In production, assume backend is on same host
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // Use the same host in production
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? 443 : 80)}`;
  }
  return 'http://localhost:3001';
};

const API_BASE = getAPIBase();

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
      const response = await fetch(`${API_BASE}/api/openings/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search openings');
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
      let url = `${API_BASE}/api/openings/list?limit=${limit}&offset=${offset}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to list openings');
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
      const response = await fetch(`${API_BASE}/api/openings/categories`);
      if (!response.ok) {
        throw new Error('Failed to get categories');
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
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.statusText}`);
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
