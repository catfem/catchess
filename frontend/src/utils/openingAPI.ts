// Opening API utility - loads directly from ECO JSON for static hosting (Cloudflare Pages)

interface EcoEntry {
  src: string;
  eco: string;
  moves: string;
  name: string;
  aliases?: Record<string, string>;
  scid?: string;
  rootSrc?: string;
}

interface EcoData {
  [fen: string]: EcoEntry;
}

interface OpeningData {
  id?: number;
  name: string;
  eco: string;
  category?: string;
  description?: string;
  moves?: string;
  fen?: string;
}

// Categorize opening based on ECO code
function categorizeOpening(name: string, eco: string): string {
  const nameLower = name.toLowerCase();
  
  // Check for gambit
  if (nameLower.includes('gambit')) {
    return 'Gambit';
  }
  
  if (!eco) return 'Other';
  
  const ecoPrefix = eco.charAt(0);
  
  switch (ecoPrefix) {
    case 'A':
      if (eco >= 'A00' && eco <= 'A09') return 'Flank Opening';
      if (eco >= 'A10' && eco <= 'A39') return 'English Opening';
      if (eco >= 'A40' && eco <= 'A44') return 'Queen\'s Pawn Game';
      if (eco >= 'A45' && eco <= 'A99') return 'Indian Defense';
      return 'Flank Opening';
    
    case 'B':
      if (eco >= 'B00' && eco <= 'B09') return 'Unusual King\'s Pawn';
      if (eco >= 'B10' && eco <= 'B19') return 'Caro-Kann Defense';
      if (eco >= 'B20' && eco <= 'B99') return 'Sicilian Defense';
      return 'Semi-Open Game';
    
    case 'C':
      if (eco >= 'C00' && eco <= 'C19') return 'French Defense';
      if (eco >= 'C20' && eco <= 'C29') return 'Open Game (1.e4 e5) - Gambits';
      if (eco >= 'C30' && eco <= 'C39') return 'Open Game (1.e4 e5)';
      if (eco >= 'C40' && eco <= 'C49') return 'Open Game - King\'s Knight';
      if (eco >= 'C50' && eco <= 'C59') return 'Italian Game';
      if (eco >= 'C60' && eco <= 'C99') return 'Ruy Lopez';
      return 'Open Game';
    
    case 'D':
      if (eco >= 'D00' && eco <= 'D05') return 'Closed Game - Systems';
      if (eco >= 'D06' && eco <= 'D69') return 'Queen\'s Gambit';
      if (eco >= 'D70' && eco <= 'D99') return 'Grünfeld Defense';
      return 'Closed Game';
    
    case 'E':
      if (eco >= 'E00' && eco <= 'E09') return 'Catalan Opening';
      if (eco >= 'E10' && eco <= 'E19') return 'Queen\'s Indian Defense';
      if (eco >= 'E20' && eco <= 'E59') return 'Nimzo-Indian Defense';
      if (eco >= 'E60' && eco <= 'E99') return 'King\'s Indian Defense';
      return 'Indian Defense';
    
    default:
      return 'Other';
  }
}

// Generate description based on opening characteristics
function generateDescription(name: string, eco: string, category: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('gambit')) {
    return `A gambit variation sacrificing material for rapid development and attacking chances. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('attack')) {
    return `An aggressive attacking system in the ${category}. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('defense') || nameLower.includes('defence')) {
    return `A solid defensive system in the ${category}. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('variation')) {
    return `A variation in the ${category}. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('counter')) {
    return `A counterattacking line in the ${category} creating dynamic imbalances. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('classical')) {
    return `A classical variation in the ${category} with natural piece development. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('modern')) {
    return `A modern approach in the ${category} with flexible piece placement. ECO code: ${eco}.`;
  }
  
  if (category.includes('Gambit')) {
    return `A gambit line offering material for initiative. ECO code: ${eco}.`;
  }
  
  if (category.includes('Defense')) {
    return `A defensive setup in the ${category}. ECO code: ${eco}.`;
  }
  
  return `A line in the ${category}. ECO code: ${eco}.`;
}

class OpeningAPIManager {
  private ecoData: EcoData | null = null;
  private openingsMap: Map<string, OpeningData> = new Map();
  private loading: boolean = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load ECO database from JSON file
   */
  async loadDatabase(): Promise<void> {
    if (this.ecoData !== null) {
      return; // Already loaded
    }

    if (this.loading) {
      return this.loadPromise!;
    }

    this.loading = true;
    this.loadPromise = this.loadDatabaseInternal();
    return this.loadPromise;
  }

  private async loadDatabaseInternal(): Promise<void> {
    try {
      console.log('📚 Loading ECO opening database from local files...');
      
      // Always use local chunked files (ecoA.json through ecoE.json)
      // This ensures reliable offline access and avoids CDN dependencies
      this.ecoData = {};
      
      const categories = ['A', 'B', 'C', 'D', 'E'];
      const loadPromises = categories.map(async (cat) => {
        try {
          const response = await fetch(`/eco${cat}.json`);
          if (!response.ok) {
            console.warn(`⚠️ Failed to load ECO chunk ${cat}: ${response.statusText}`);
            return;
          }
          const chunkData: EcoData = await response.json();
          if (this.ecoData) {
            Object.assign(this.ecoData, chunkData);
          }
          console.log(`  ✓ ECO chunk ${cat}: ${Object.keys(chunkData).length} positions`);
        } catch (error) {
          console.warn(`⚠️ Failed to load ECO chunk ${cat}:`, error);
        }
      });
      
      await Promise.all(loadPromises);
      
      // Process and index openings
      this.indexOpenings();
      
      const totalPositions = this.ecoData ? Object.keys(this.ecoData).length : 0;
      console.log(`✓ ECO database loaded successfully: ${this.openingsMap.size} unique openings (${totalPositions} positions)`);
    } catch (error) {
      console.error('❌ Failed to load ECO database:', error);
      this.ecoData = {};
    } finally {
      this.loading = false;
    }
  }

  /**
   * Index openings for faster lookup
   */
  private indexOpenings(): void {
    if (!this.ecoData) return;

    const seenOpenings = new Set<string>();

    for (const [fen, entry] of Object.entries(this.ecoData)) {
      const key = `${entry.name}|${entry.eco}`;
      
      if (!seenOpenings.has(key)) {
        seenOpenings.add(key);
        
        const category = categorizeOpening(entry.name, entry.eco);
        const description = generateDescription(entry.name, entry.eco, category);
        
        const openingData: OpeningData = {
          name: entry.name,
          eco: entry.eco,
          category,
          description,
          moves: entry.moves,
          fen,
        };
        
        this.openingsMap.set(key, openingData);
        // Also index by name only for quick lookup
        this.openingsMap.set(entry.name.toLowerCase(), openingData);
      }
    }
  }

  /**
   * Get opening by name
   */
  async getOpeningByName(name: string): Promise<OpeningData | null> {
    await this.loadDatabase();
    
    if (!name) return null;

    // Try exact match first
    const exactMatch = this.openingsMap.get(name.toLowerCase());
    if (exactMatch) {
      return exactMatch;
    }

    // Try partial match
    const nameLower = name.toLowerCase();
    for (const opening of this.openingsMap.values()) {
      if (opening.name.toLowerCase() === nameLower) {
        return opening;
      }
    }

    return null;
  }

  /**
   * Search openings by query
   */
  async searchOpenings(query: string): Promise<OpeningData[]> {
    await this.loadDatabase();
    
    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const results: OpeningData[] = [];
    const seen = new Set<string>();

    for (const opening of this.openingsMap.values()) {
      // Skip duplicates (indexed by both name and name|eco)
      const uniqueKey = `${opening.name}|${opening.eco}`;
      if (seen.has(uniqueKey)) continue;
      
      // Match name, ECO code, or category
      if (
        opening.name.toLowerCase().includes(queryLower) ||
        opening.eco.toLowerCase().includes(queryLower) ||
        opening.category?.toLowerCase().includes(queryLower)
      ) {
        results.push(opening);
        seen.add(uniqueKey);
      }

      // Limit results
      if (results.length >= 50) break;
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all openings with pagination
   */
  async listOpenings(category?: string, limit: number = 100, offset: number = 0): Promise<OpeningData[]> {
    await this.loadDatabase();
    
    const allOpenings: OpeningData[] = [];
    const seen = new Set<string>();

    for (const opening of this.openingsMap.values()) {
      const uniqueKey = `${opening.name}|${opening.eco}`;
      if (seen.has(uniqueKey)) continue;
      
      if (!category || opening.category === category) {
        allOpenings.push(opening);
        seen.add(uniqueKey);
      }
    }

    // Sort by name
    allOpenings.sort((a, b) => a.name.localeCompare(b.name));

    // Apply pagination
    return allOpenings.slice(offset, offset + limit);
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    await this.loadDatabase();
    
    const categories = new Set<string>();
    
    for (const opening of this.openingsMap.values()) {
      if (opening.category) {
        categories.add(opening.category);
      }
    }

    return Array.from(categories).sort();
  }

  /**
   * Get opening info by FEN (for book move detection)
   */
  getOpeningByFen(fen: string): OpeningData | null {
    if (!this.ecoData) return null;

    const entry = this.ecoData[fen];
    if (!entry) return null;

    const category = categorizeOpening(entry.name, entry.eco);
    const description = generateDescription(entry.name, entry.eco, category);

    return {
      name: entry.name,
      eco: entry.eco,
      category,
      description,
      moves: entry.moves,
      fen,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.openingsMap.clear();
    this.ecoData = null;
    this.loading = false;
    this.loadPromise = null;
  }
}

export const openingAPIManager = new OpeningAPIManager();

// Auto-load the database
openingAPIManager.loadDatabase().catch(console.error);
