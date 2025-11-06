import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'chess_openings.db');

let db = null;

export function initializeDatabase() {
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create openings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS openings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      eco TEXT,
      fen TEXT,
      moves TEXT,
      description TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_opening_name ON openings(name);
    CREATE INDEX IF NOT EXISTS idx_opening_eco ON openings(eco);
    CREATE INDEX IF NOT EXISTS idx_opening_category ON openings(category);
  `);
  
  // Check if data already exists
  const count = db.prepare('SELECT COUNT(*) as count FROM openings').get();
  
  if (count.count === 0) {
    populateOpeningsDatabase(db);
  }
  
  console.log(`✓ Database initialized with ${count.count} openings`);
  
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

function categorizeOpening(name, eco) {
  const nameLower = name.toLowerCase();
  
  // Check for gambit
  if (nameLower.includes('gambit')) {
    return 'Gambit';
  }
  
  // ECO-based categorization
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

function generateDescription(name, eco, category, moves) {
  const nameLower = name.toLowerCase();
  
  // Check for gambit
  if (nameLower.includes('gambit')) {
    return `A gambit variation sacrificing material for rapid development and attacking chances. ECO code: ${eco}.`;
  }
  
  // Check for attack/defense
  if (nameLower.includes('attack')) {
    return `An aggressive attacking system in the ${category}. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('defense') || nameLower.includes('defence')) {
    return `A solid defensive system in the ${category}. ECO code: ${eco}.`;
  }
  
  // Check for variation
  if (nameLower.includes('variation')) {
    return `A variation in the ${category}. ECO code: ${eco}.`;
  }
  
  // Check for opening type keywords
  if (nameLower.includes('counter')) {
    return `A counterattacking line in the ${category} creating dynamic imbalances. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('classical')) {
    return `A classical variation in the ${category} with natural piece development. ECO code: ${eco}.`;
  }
  
  if (nameLower.includes('modern')) {
    return `A modern approach in the ${category} with flexible piece placement. ECO code: ${eco}.`;
  }
  
  // Default descriptions based on category
  if (category.includes('Gambit')) {
    return `A gambit line offering material for initiative. ECO code: ${eco}.`;
  }
  
  if (category.includes('Defense')) {
    return `A defensive setup in the ${category}. ECO code: ${eco}.`;
  }
  
  // Generic description
  return `A line in the ${category}. ECO code: ${eco}.`;
}

function populateOpeningsDatabase(db) {
  // Load from local chunked ECO JSON files (ecoA-E.json)
  console.log('📚 Loading ECO database from local chunked files...');
  
  const ecoData = {};
  const categories = ['A', 'B', 'C', 'D', 'E'];
  
  for (const cat of categories) {
    const ecoPath = path.join(__dirname, '..', '..', 'frontend', 'public', `eco${cat}.json`);
    
    if (!fs.existsSync(ecoPath)) {
      console.warn(`⚠️ ECO chunk ${cat} not found at ${ecoPath}`);
      continue;
    }
    
    try {
      const chunkData = JSON.parse(fs.readFileSync(ecoPath, 'utf8'));
      Object.assign(ecoData, chunkData);
      console.log(`  ✓ Loaded ECO chunk ${cat}: ${Object.keys(chunkData).length} positions`);
    } catch (error) {
      console.error(`❌ Failed to load ECO chunk ${cat}:`, error.message);
    }
  }
  
  const totalPositions = Object.keys(ecoData).length;
  if (totalPositions === 0) {
    console.warn('⚠️ No ECO data loaded, skipping database population');
    return;
  }
  
  console.log(`✓ Total ECO positions loaded: ${totalPositions}`);
  
  // Extract unique openings
  const openingsMap = new Map();
  
  for (const [fen, entry] of Object.entries(ecoData)) {
    const key = `${entry.name}|${entry.eco}`;
    
    if (!openingsMap.has(key)) {
      openingsMap.set(key, {
        name: entry.name,
        eco: entry.eco,
        moves: entry.moves,
        fen: fen,
      });
    }
  }
  
  console.log(`Processing ${openingsMap.size} unique openings...`);
  
  // Prepare insert statement
  const stmt = db.prepare(`
    INSERT INTO openings (name, eco, fen, moves, category, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Insert all openings in a transaction
  const insertMany = db.transaction((openings) => {
    let count = 0;
    for (const opening of openings) {
      const category = categorizeOpening(opening.name, opening.eco);
      const description = generateDescription(opening.name, opening.eco, category, opening.moves);
      
      try {
        stmt.run(
          opening.name,
          opening.eco,
          opening.fen,
          opening.moves,
          category,
          description
        );
        count++;
      } catch (error) {
        // Skip duplicates
      }
    }
    return count;
  });
  
  const inserted = insertMany([...openingsMap.values()]);
  console.log(`✓ Inserted ${inserted} openings into database`);
}
