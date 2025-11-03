/**
 * IndexedDB Storage Utilities for CatChess
 * Handles local game history, settings, and offline data
 */

const DB_NAME = 'catchess';
const DB_VERSION = 1;

export interface StoredGame {
  id: string;
  pgn: string;
  result: string;
  timeControl: string;
  whitePlayer: string;
  blackPlayer: string;
  timestamp: number;
  analyzed: boolean;
}

export interface UserSettings {
  boardTheme: string;
  pieceSet: string;
  soundEnabled: boolean;
  soundVolume: number;
  autoQueen: boolean;
  premoveEnabled: boolean;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  animationSpeed: number;
  analysisEnabled: boolean;
  engineDepth: number;
  themeMode: 'light' | 'dark';
  language: string;
  timezone: string;
}

export interface PuzzleProgress {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  lastAttempt: number;
}

class ChessDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'id' });
          gamesStore.createIndex('timestamp', 'timestamp', { unique: false });
          gamesStore.createIndex('analyzed', 'analyzed', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Puzzle progress store
        if (!db.objectStoreNames.contains('puzzleProgress')) {
          const puzzleStore = db.createObjectStore('puzzleProgress', { keyPath: 'puzzleId' });
          puzzleStore.createIndex('solved', 'solved', { unique: false });
          puzzleStore.createIndex('lastAttempt', 'lastAttempt', { unique: false });
        }

        // Cached openings
        if (!db.objectStoreNames.contains('openings')) {
          db.createObjectStore('openings', { keyPath: 'eco' });
        }

        // Offline queue for syncing
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // ====== GAME STORAGE ======

  async saveGame(game: StoredGame): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('games', 'readwrite');
      const request = store.put(game);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getGame(id: string): Promise<StoredGame | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('games');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllGames(limit = 100): Promise<StoredGame[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('games');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const games: StoredGame[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          games.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(games);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteGame(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('games', 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ====== SETTINGS STORAGE ======

  async saveSetting(key: string, value: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readwrite');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSettings(): Promise<UserSettings> {
    const defaults: UserSettings = {
      boardTheme: 'classic',
      pieceSet: 'standard',
      soundEnabled: true,
      soundVolume: 50,
      autoQueen: false,
      premoveEnabled: true,
      showCoordinates: true,
      showLegalMoves: true,
      animationSpeed: 200,
      analysisEnabled: true,
      engineDepth: 18,
      themeMode: 'dark',
      language: 'en',
      timezone: 'UTC',
    };

    const store = this.getStore('settings');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const settings: UserSettings = { ...defaults };
        const entries = request.result as Array<{ key: string; value: string | number | boolean }>;
        entries.forEach(({ key, value }) => {
          switch (key) {
            case 'boardTheme':
              settings.boardTheme = value as UserSettings['boardTheme'];
              break;
            case 'pieceSet':
              settings.pieceSet = value as UserSettings['pieceSet'];
              break;
            case 'soundEnabled':
              settings.soundEnabled = value as UserSettings['soundEnabled'];
              break;
            case 'soundVolume':
              settings.soundVolume = value as UserSettings['soundVolume'];
              break;
            case 'autoQueen':
              settings.autoQueen = value as UserSettings['autoQueen'];
              break;
            case 'premoveEnabled':
              settings.premoveEnabled = value as UserSettings['premoveEnabled'];
              break;
            case 'showCoordinates':
              settings.showCoordinates = value as UserSettings['showCoordinates'];
              break;
            case 'showLegalMoves':
              settings.showLegalMoves = value as UserSettings['showLegalMoves'];
              break;
            case 'animationSpeed':
              settings.animationSpeed = value as UserSettings['animationSpeed'];
              break;
            case 'analysisEnabled':
              settings.analysisEnabled = value as UserSettings['analysisEnabled'];
              break;
            case 'engineDepth':
              settings.engineDepth = value as UserSettings['engineDepth'];
              break;
            case 'themeMode':
              settings.themeMode = value as UserSettings['themeMode'];
              break;
            case 'language':
              settings.language = value as UserSettings['language'];
              break;
            case 'timezone':
              settings.timezone = value as UserSettings['timezone'];
              break;
            default:
              break;
          }
        });
        resolve(settings);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ====== PUZZLE PROGRESS ======

  async savePuzzleProgress(progress: PuzzleProgress): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('puzzleProgress', 'readwrite');
      const request = store.put(progress);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPuzzleProgress(puzzleId: string): Promise<PuzzleProgress | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('puzzleProgress');
      const request = store.get(puzzleId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSolvedPuzzles(): Promise<PuzzleProgress[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('puzzleProgress');
      const index = store.index('solved');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result as PuzzleProgress[];
        resolve(results.filter((p) => p.solved));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ====== SYNC QUEUE ======

  async addToSyncQueue(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('syncQueue', 'readwrite');
      const request = store.add({
        ...data,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('syncQueue', 'readwrite');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ====== UTILITY METHODS ======

  async clear(): Promise<void> {
    if (!this.db) return;

    const stores = ['games', 'settings', 'puzzleProgress', 'openings', 'syncQueue'];
    
    await Promise.all(
      stores.map((storeName) => {
        return new Promise<void>((resolve, reject) => {
          const store = this.getStore(storeName, 'readwrite');
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const chessDB = new ChessDB();

// Auto-initialize on import
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  chessDB.init().catch((err) => {
    console.error('Failed to initialize IndexedDB:', err);
  });
}
