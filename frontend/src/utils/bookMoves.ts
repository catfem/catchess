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
      console.log('📚 Loading ECO opening book database from local files...');
      
      // Always use local chunked files (ecoA.json through ecoE.json)
      // This ensures reliable offline access and avoids CDN dependencies
      await this.loadLocalChunks();
      
      const totalPositions = Object.keys(this.ecoData).length;
      if (totalPositions > 0) {
        console.log(`✓ ECO database loaded successfully: ${totalPositions} positions`);
      } else {
        console.error('⚠️ ECO database loaded but contains no positions');
      }
    } catch (error) {
      console.error('❌ Failed to load ECO database:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load ECO database from local chunked files
   * Loads ecoA.json through ecoE.json from the public directory
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
        console.warn(`⚠️ Failed to load ECO chunk ${category}: ${response.statusText}`);
        return;
      }
      const chunkData: EcoData = await response.json();
      Object.assign(this.ecoData, chunkData);
      console.log(`  ✓ ECO chunk ${category}: ${Object.keys(chunkData).length} positions`);
    } catch (error) {
      console.warn(`⚠️ Failed to load ECO chunk ${category}:`, error);
      // Continue with other chunks even if one fails
    }
  }

  /**
   * Check if a position (FEN) is a known book position
   * This is async to ensure database is loaded before checking
   */
  async isBookPosition(fen: string): Promise<boolean> {
    // Ensure database is loaded
    await this.loadDatabase();
    
    const dbSize = Object.keys(this.ecoData).length;
    console.log(`📖 Book database status: ${dbSize} positions loaded`);
    
    if (!this.ecoData || dbSize === 0) {
      console.warn('⚠️ ECO database not loaded - cannot check book moves');
      return false; // No data loaded yet
    }

    // Check cache first
    if (this.positionCache.has(fen)) {
      const cachedResult = this.positionCache.get(fen)!;
      console.log(`  ✓ Found in cache: ${cachedResult}`);
      return cachedResult;
    }

    let isBook = false;

    // Try exact match first
    if (fen in this.ecoData) {
      console.log(`  ✓ Exact FEN match found!`);
      isBook = true;
    } else {
      // FEN string might have different move counts, so try without those
      // ECO database uses FEN format: position side castling ep halfmove fullmove
      // We'll try matching with just the key parts
      const parts = fen.split(' ');
      if (parts.length >= 4) {
        // Try with first 4 parts (position, side, castling, en passant)
        const keyParts = parts.slice(0, 4).join(' ');
        console.log(`  Searching for key parts: ${keyParts}`);
        
        // Check all entries with matching key parts
        for (const ecoFen in this.ecoData) {
          const ecoKeyParts = ecoFen.split(' ').slice(0, 4).join(' ');
          if (keyParts === ecoKeyParts) {
            console.log(`  ✓ Partial FEN match found!`);
            console.log(`  Matched ECO FEN: ${ecoFen}`);
            isBook = true;
            break;
          }
        }
        
        if (!isBook) {
          console.log(`  ✗ No match found in ${dbSize} positions`);
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
