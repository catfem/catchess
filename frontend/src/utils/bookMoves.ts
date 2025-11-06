// Book move detection using ECO database
// ECO (Encyclopedia of Chess Openings) database contains known opening positions

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

class BookMovesDetector {
  private ecoData: EcoData = {};
  private loading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private positionCache: Map<string, boolean> = new Map(); // Cache for faster lookups

  /**
   * Load ECO database from local files
   * ECO database files are bundled with the app for reliable offline access
   */
  async loadDatabase(): Promise<void> {
    if (Object.keys(this.ecoData).length > 0) {
      return; // Already loaded
    }

    if (this.loading) {
      // Already loading, wait for it
      return this.loadPromise!;
    }

    this.loading = true;
    this.loadPromise = this.loadDatabaseInternal();
    return this.loadPromise;
  }

  private async loadDatabaseInternal(): Promise<void> {
    try {
      console.log('Loading ECO opening book database...');
      
      // Try to load the complete interpolated database first (faster, single file)
      const response = await fetch('/eco_interpolated.json');
      
      if (response.ok) {
        this.ecoData = await response.json();
        console.log(`✓ ECO database loaded: ${Object.keys(this.ecoData).length} positions`);
      } else {
        // Fallback to chunked files if the interpolated version isn't available
        console.log('Loading ECO database from chunks...');
        await this.loadLocalChunks();
      }
    } catch (error) {
      console.error('Failed to load ECO database:', error);
      // Try fallback to chunked files
      console.log('Attempting fallback to ECO database chunks...');
      await this.loadLocalChunks();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Fallback method to load ECO database from local chunked files
   * Used if the complete interpolated file is unavailable
   */
  private async loadLocalChunks(): Promise<void> {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const promises = categories.map(cat => this.loadLocalChunk(cat));
    await Promise.all(promises);
  }

  private async loadLocalChunk(category: string): Promise<void> {
    try {
      const response = await fetch(`/eco${category}.json`);
      if (!response.ok) {
        console.warn(`Failed to load local ECO chunk ${category}: ${response.statusText}`);
        return;
      }
      const chunkData: EcoData = await response.json();
      Object.assign(this.ecoData, chunkData);
      console.log(`✓ Local ECO chunk ${category} loaded: ${Object.keys(chunkData).length} positions`);
    } catch (error) {
      console.warn(`Failed to load local ECO chunk ${category}:`, error);
      // Continue with other chunks
    }
  }

  /**
   * Check if a position (FEN) is a known book position
   * This is async to ensure database is loaded before checking
   */
  async isBookPosition(fen: string): Promise<boolean> {
    // Ensure database is loaded
    await this.loadDatabase();
    
    if (!this.ecoData || Object.keys(this.ecoData).length === 0) {
      return false; // No data loaded yet
    }

    // Check cache first
    if (this.positionCache.has(fen)) {
      return this.positionCache.get(fen)!;
    }

    let isBook = false;

    // Try exact match first
    if (fen in this.ecoData) {
      isBook = true;
    } else {
      // FEN string might have different move counts, so try without those
      // ECO database uses FEN format: position side castling ep halfmove fullmove
      // We'll try matching with just the key parts
      const parts = fen.split(' ');
      if (parts.length >= 4) {
        // Try with first 4 parts (position, side, castling, en passant)
        const keyParts = parts.slice(0, 4).join(' ');
        
        // Check all entries with matching key parts
        for (const ecoFen in this.ecoData) {
          const ecoKeyParts = ecoFen.split(' ').slice(0, 4).join(' ');
          if (keyParts === ecoKeyParts) {
            isBook = true;
            break;
          }
        }
      }
    }
    
    // Cache the result
    this.positionCache.set(fen, isBook);
    return isBook;
  }

  /**
   * Get opening information for a position
   */
  getOpeningInfo(fen: string): { name: string; eco: string; moves: string } | null {
    if (!this.ecoData) {
      return null;
    }

    const normalizedFen = this.normalizeFen(fen);
    const data = this.ecoData[normalizedFen];

    if (!data) {
      return null;
    }

    return {
      name: data.name,
      eco: data.eco,
      moves: data.moves,
    };
  }

  /**
   * Normalize FEN to match ECO database format
   * The ECO database uses full FEN but we should check exact matches
   */
  private normalizeFen(fen: string): string {
    // ECO database seems to use full FEN strings
    // We'll try exact match first, but might need to adjust
    return fen;
  }

  /**
   * Check if database is loaded
   */
  isLoaded(): boolean {
    return Object.keys(this.ecoData).length > 0 && !this.loading;
  }
}

// Export singleton instance
export const bookMovesDetector = new BookMovesDetector();

// Auto-load the database when the module is imported
// This ensures it's ready by the time we need it
bookMovesDetector.loadDatabase().catch(console.error);
