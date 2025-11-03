import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

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
  
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

function populateOpeningsDatabase(db) {
  const openings = [
    // Ruy Lopez
    { name: 'Ruy Lopez', eco: 'C60-C99', category: 'Open Game', description: 'One of the strongest and most popular openings. White attacks the e5 pawn with the knight, forcing Black to make a decision about defending it.' },
    { name: 'Ruy Lopez: Open', eco: 'C80-C89', category: 'Ruy Lopez', description: 'The main line where Black plays 3...a6. After 4.Ba4 Nf6 5.0-0 Be7, this is one of the most popular positions with balanced play.' },
    { name: 'Ruy Lopez: Closed', eco: 'C84-C89', category: 'Ruy Lopez', description: 'Black plays without d5, leading to closed positions with long-term strategic battles and pawn structure importance.' },
    { name: 'Ruy Lopez: Berlin Defense', eco: 'C67-C69', category: 'Ruy Lopez', description: 'Black counters with 3...Nf6, popular at highest levels. It leads to sharp middlegames or closed technical positions.' },
    { name: 'Ruy Lopez: Morphy Defense', eco: 'C78', category: 'Ruy Lopez', description: 'The main line with 3...a6 4.Ba4 Nf6 5.0-0 Be7 6.Re1 b5 7.Bb3. White maintains pressure while Black seeks counterplay.' },
    { name: 'Ruy Lopez: Norwegian Variation', eco: 'C62', category: 'Ruy Lopez', description: 'Black plays an early g6, preparing fianchetto ideas and creating a flexible position.' },
    { name: 'Ruy Lopez: Schliemann Defense', eco: 'C64', category: 'Ruy Lopez', description: 'Black plays 3...f5, immediately counterattacking. This leads to sharp tactical positions with mutual attacking chances.' },

    // Italian Game
    { name: 'Italian Game', eco: 'C50-C59', category: 'Open Game', description: 'A classical opening where both sides develop quickly. White usually plays 3.Bc4, targeting the weak f7 pawn.' },
    { name: 'Italian Game: Two Knights Defense', eco: 'C55-C56', category: 'Italian Game', description: 'Black plays 2...Nf6, leading to sharp tactical play with possibilities for tactical complications.' },
    { name: 'Italian Game: Two Knights Defense: Fried Liver', eco: 'C57', category: 'Italian Game', description: 'White sacrifices the knight on d5 to create a dangerous attack against the Black king.' },
    { name: 'Italian Game: Two Knights Defense: Traxler Counterattack', eco: 'C57', category: 'Italian Game', description: 'Black sacrifices the e4 pawn to create immediate counterplay. This leads to wild, tactical positions.' },
    { name: 'Italian Game: Giuoco Piano', eco: 'C50', category: 'Italian Game', description: 'A solid continuation with 3...Bc5. The opening tends to be less sharp than Two Knights Defense.' },
    { name: 'Italian Game: Giuoco Pianissimo', eco: 'C50', category: 'Italian Game', description: 'An ultra-solid approach where White plays 4.d3, avoiding the sharp main lines.' },
    { name: 'Italian Game: Evans Gambit', eco: 'C51-C52', category: 'Italian Game', description: 'White sacrifices the b4 pawn early to gain rapid piece development and create attacking chances.' },

    // Sicilian Defense
    { name: 'Sicilian Defense', eco: 'B20-B99', category: 'Semi-Open Game', description: "Black's most popular response to 1.e4. By playing 1...c5, Black immediately attacks the center." },
    { name: 'Sicilian: Open', eco: 'B40-B49', category: 'Sicilian', description: 'White plays 3.d4 cxd4 4.Nxd4, leading to mainlines where White maintains a space advantage.' },
    { name: 'Sicilian: Closed', eco: 'B25-B29', category: 'Sicilian', description: 'White avoids 3.d4 and plays Nc3, building up slowly with f4 and kingside attacks.' },
    { name: 'Sicilian: Najdorf', eco: 'B90-B99', category: 'Sicilian', description: 'A flexible and solid response by Black with 5...e6. One of the most respected defenses against 1.e4.' },
    { name: 'Sicilian: Najdorf: English Attack', eco: 'B90', category: 'Sicilian', description: 'White plays 6.Be3 and f4, creating a flexible pawn structure and avoiding sharp theoretical positions.' },
    { name: 'Sicilian: Najdorf: Main Line', eco: 'B90-B99', category: 'Sicilian', description: 'The critical line where White plays 6.Bg5, leading to sharp positions with opposite-side castling.' },
    { name: 'Sicilian: Dragon', eco: 'B70-B79', category: 'Sicilian', description: 'An aggressive defense where Black plays 5...g6 and Bg7 to control the long diagonal.' },
    { name: 'Sicilian: Dragon: Classical', eco: 'B70', category: 'Sicilian', description: 'White plays 6.Be3, leading to strategic struggles where both sides play for long-term plans.' },
    { name: 'Sicilian: Dragon: Yugoslav Attack', eco: 'B75-B79', category: 'Sicilian', description: 'White plays 6.Bg5, leading to some of the sharpest positions in chess with both sides attacking.' },
    { name: 'Sicilian: Taimanov', eco: 'B51-B52', category: 'Sicilian', description: 'A solid continuation with 5...e6 and 6...e5, leading to a restrained but flexible position.' },
    { name: 'Sicilian: Sveshnikov', eco: 'B33', category: 'Sicilian', description: 'Black plays 5...e5, immediately addressing the center. This leads to dynamic play with chances.' },
    { name: 'Sicilian: Classical', eco: 'B30-B32', category: 'Sicilian', description: 'A solid choice with 5...e6, preparing to develop pieces naturally.' },
    { name: 'Sicilian: Positional', eco: 'B20-B26', category: 'Sicilian', description: 'White avoids sharp main lines and plays positionally, trying to build up a slow advantage.' },
    { name: 'Sicilian: Giri Variation', eco: 'B30-B39', category: 'Sicilian', description: 'A modern approach to the Sicilian by White, avoiding the main theoretical battles.' },

    // French Defense
    { name: 'French Defense', eco: 'C00-C19', category: 'Semi-Open Game', description: 'Black plays 1...e6, establishing a solid pawn structure characterized by long-term positional maneuvering.' },
    { name: 'French: Winawer', eco: 'C11-C15', category: 'French', description: 'A sharp variation where Black plays 4...Bb4, immediately challenging White center.' },
    { name: 'French: Winawer: Main Line', eco: 'C12-C15', category: 'French', description: 'The critical line where White plays 5.a3, forcing Black to make an immediate decision.' },
    { name: 'French: Winawer: Positional Line', eco: 'C11', category: 'French', description: 'White plays 5.Nf3, avoiding sharp forcing variations and maintaining flexibility.' },
    { name: 'French: Classical', eco: 'C17-C19', category: 'French', description: 'Black develops without the early bishop check. This leads to more positional play.' },
    { name: 'French: Tarrasch', eco: 'C04-C09', category: 'French', description: 'White plays 3.Nd2, supporting the e4 pawn and avoiding the Winawer Variation.' },
    { name: 'French: Tarrasch: Closed', eco: 'C04-C06', category: 'French', description: 'White plays d4 and avoids early exchanges, leading to long-term maneuvering games.' },
    { name: 'French: Tarrasch: Open', eco: 'C07-C09', category: 'French', description: 'White allows f6 pawn, leading to more open positions with piece play.' },

    // Caro-Kann Defense
    { name: 'Caro-Kann Defense', eco: 'B10-B19', category: 'Semi-Open Game', description: "Black's solid alternative to the French. After 1...c6, Black supports the d5 advance." },
    { name: 'Caro-Kann: Classical', eco: 'B13-B15', category: 'Caro-Kann', description: 'Black plays 3...Nf6 and 4...dxe4, leading to balanced positions with strategic complexity.' },
    { name: 'Caro-Kann: Main Line', eco: 'B18-B19', category: 'Caro-Kann', description: 'The critical variation where White plays 3.Nc3. Rich in tactical possibilities.' },
    { name: 'Caro-Kann: Advance Variation', eco: 'B12', category: 'Caro-Kann', description: 'White maintains the pawn on e4 and plays e5, establishing space.' },
    { name: 'Caro-Kann: Two Knights Variation', eco: 'B11', category: 'Caro-Kann', description: 'White plays 3.Nf3 Nf6 4.e5, leading to a sharp struggle for space.' },

    // Queen's Gambit
    { name: 'Queen\'s Gambit', eco: 'D04-D05', category: 'Closed Game', description: "White's main alternative to 1.e4. By playing 1.d4 d5 2.c4, White offers a pawn." },
    { name: 'Queen\'s Gambit: Accepted', eco: 'D20-D29', category: 'Queen\'s Gambit', description: 'Black accepts with 2...dxc4. White tries to regain the pawn with advantage.' },
    { name: 'Queen\'s Gambit: Declined', eco: 'D30-D69', category: 'Queen\'s Gambit', description: 'Black refuses the gambit and maintains the tension. Strategic, long-term maneuvering.' },
    { name: 'Queen\'s Gambit: Declined: Orthodox Defense', eco: 'D50-D59', category: 'Queen\'s Gambit', description: 'Black plays 2...e6 and 3...Nf6, establishing a solid pawn structure.' },
    { name: 'Queen\'s Gambit: Declined: Slav Defense', eco: 'D10-D19', category: 'Queen\'s Gambit', description: 'Black plays 2...c6, supporting the center without blocking the c-file.' },
    { name: 'Queen\'s Gambit: Declined: Semi-Slav', eco: 'D43-D49', category: 'Queen\'s Gambit', description: 'Black plays 2...c6 and 3...e6, combining elements of both setups.' },

    // King's Indian Defense
    { name: 'King\'s Indian Defense', eco: 'E60-E99', category: 'Indian Defense', description: 'Black plays 1...Nf6 and 2...g6, preparing to fianchetto the bishop.' },
    { name: 'King\'s Indian: Classical', eco: 'E70-E79', category: 'King\'s Indian', description: 'Black plays 3...Bg7 and develops naturally. Rich middlegames with chances.' },
    { name: 'King\'s Indian: Fianchetto', eco: 'E62-E69', category: 'King\'s Indian', description: 'White also fianchettoes the kingside bishop with g3.' },
    { name: 'King\'s Indian: Sämisch', eco: 'E80-E89', category: 'King\'s Indian', description: 'White plays 3.f3, creating a solid pawn base for e4. Strategic battles.' },
    { name: 'King\'s Indian: Four Pawns', eco: 'E75-E79', category: 'King\'s Indian', description: 'White plays 3.c4 and f4, establishing maximum space.' },

    // Nimzo-Indian Defense
    { name: 'Nimzo-Indian Defense', eco: 'E20-E59', category: 'Indian Defense', description: 'Black plays 3...Bb4, immediately pinning the knight.' },
    { name: 'Nimzo-Indian: Classical', eco: 'E36-E39', category: 'Nimzo-Indian', description: 'Black plays 4...Bxc3+ 5.bxc3, leading to a doubled pawn structure for White.' },
    { name: 'Nimzo-Indian: Rubinstein', eco: 'E32-E35', category: 'Nimzo-Indian', description: 'Black plays 4...0-0, maintaining the pin and creating dynamic counterplay.' },

    // Grünfeld Defense
    { name: 'Grünfeld Defense', eco: 'D80-D99', category: 'Indian Defense', description: 'Black plays 1...d4 Nf6 2.c4 g6 3.Nc3 d5, immediately challenging White center.' },
    { name: 'Grünfeld: Classical', eco: 'D85-D89', category: 'Grünfeld', description: 'Black plays 3...d5 4.cxd5 Nxd5, leading to open middlegame positions.' },
    { name: 'Grünfeld: Russian System', eco: 'D85-D89', category: 'Grünfeld', description: 'White plays 5.cxd5 Nxd5 6.e4, establishing a strong center.' },

    // Catalan Opening
    { name: 'Catalan Opening', eco: 'E01-E09', category: 'Semi-Open Game', description: 'White plays 1.d4 Nf6 2.c4 e6 3.g3, combining gambit with kingside fianchetto.' },
    { name: 'Catalan: Open', eco: 'E05-E09', category: 'Catalan', description: 'Black plays 3...d5, immediately challenging White center.' },
    { name: 'Catalan: Closed', eco: 'E01-E04', category: 'Catalan', description: 'Black avoids taking on c4, leading to strategic battles.' },

    // English Opening
    { name: 'English Opening', eco: 'A10-A39', category: 'Flank Opening', description: 'White plays 1.c4, avoiding main theoretical battles and establishing strategic struggle.' },
    { name: 'English: Symmetrical', eco: 'A30-A39', category: 'English', description: 'Black responds with 1...c5, creating a symmetrical pawn structure.' },

    // Reti Opening
    { name: 'Reti Opening', eco: 'A04-A09', category: 'Flank Opening', description: 'White plays 1.Nf3, preparing to control center with pawns from distance.' },

    // Gambits
    { name: 'King\'s Gambit', eco: 'C20-C29', category: 'Open Game', description: 'White plays 1.e4 e5 2.f4, immediately sacrificing a pawn for rapid development.' },
    { name: 'King\'s Gambit: Accepted', eco: 'C24-C29', category: 'King\'s Gambit', description: 'Black takes the pawn with 2...exf4, leading to sharp attacking positions.' },
    { name: 'King\'s Gambit: Declined', eco: 'C20-C23', category: 'King\'s Gambit', description: 'Black declines the gambit, maintaining central control.' },
    
    { name: 'Evans Gambit', eco: 'C51-C52', category: 'Open Game', description: 'White plays 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4, sacrificing for rapid development.' },
    { name: 'Evans Gambit: Accepted', eco: 'C51', category: 'Evans Gambit', description: 'Black takes the pawn, and White generates attacking chances.' },
    
    { name: 'Danish Gambit', eco: 'D20', category: 'Closed Game', description: 'White plays 1.d4 d5 2.c4 dxc4 3.e3, sacrificing a pawn for development.' },
    
    { name: 'Budapest Defense', eco: 'A51-A52', category: 'Flank Opening', description: 'Black plays 1.d4 Nf6 2.c4 e5, sacrificing e5 pawn for counterplay.' },
    { name: 'Budapest Defense: Main Line', eco: 'A51', category: 'Budapest', description: 'White plays 3.dxe5, accepting the pawn and the resulting complications.' },
    
    { name: 'Benko Gambit', eco: 'A56-A57', category: 'Flank Opening', description: 'Black plays 1.d4 Nf6 2.c4 c5 3.d5 b5, sacrificing b-pawn for queenside counterplay.' },

    // Other defenses
    { name: 'Pirc Defense', eco: 'B06-B08', category: 'Semi-Open Game', description: 'Black plays 1...d6 and 2...Nf6, preparing to fianchetto kingside bishop.' },
    { name: 'Modern Defense', eco: 'B06-B08', category: 'Semi-Open Game', description: 'Black plays 1...g6 and 2...Bg7, establishing fianchettoed position immediately.' },
    { name: 'Alekhine\'s Defense', eco: 'B02-B05', category: 'Semi-Open Game', description: 'Black plays 1...Nf6, attacking e4 pawn. Black accepts displaced knight to provoke.' },
    { name: 'Philidor Defense', eco: 'C41-C42', category: 'Open Game', description: 'Black plays 1...e5 and 2...d6, supporting e5 pawn from behind.' },
    { name: 'Petrov\'s Defense', eco: 'C43-C49', category: 'Open Game', description: 'A symmetrical defense where Black mirrors White moves with 1...e5 and 2...Nf6.' },
    { name: 'Scandinavian Defense', eco: 'B01', category: 'Semi-Open Game', description: 'An aggressive response to 1.e4 with 1...d5, immediately challenging center.' },
    { name: 'Benoni Defense', eco: 'D56-D69', category: 'Closed Game', description: 'Black plays 1.d4 Nf6 2.c4 c5, immediately challenging White center.' },

    // Systems
    { name: 'Colle System', eco: 'D05', category: 'Closed Game', description: 'White plays 1.d4 Nf6 2.Nf3 d5 3.c3, preparing e3 and Be2. Solid positional setup.' },
    { name: 'London System', eco: 'D02-D04', category: 'Closed Game', description: 'A solid setup with d4, Nf3, c3, e3, Bd3, Nbd2. Reliable and strategically sound.' },

    // Uncommon but playable
    { name: 'Bird\'s Opening', eco: 'A02-A03', category: 'Flank Opening', description: 'White plays 1.f4, establishing an immediate fianchetto structure.' },
    { name: 'Orangutan Opening', eco: 'A00', category: 'Irregular Opening', description: 'White plays 1.b4, creating immediate queenside space. Unusual but playable.' },
    { name: 'Hippopotamus Defense', eco: 'B00', category: 'Irregular Opening', description: 'Black establishes a solid formation. Creates a fortress-like structure.' },
  ];

  const stmt = db.prepare(`
    INSERT INTO openings (name, eco, category, description)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((openings) => {
    for (const opening of openings) {
      stmt.run(opening.name, opening.eco, opening.category, opening.description);
    }
  });

  insertMany(openings);
  console.log(`Inserted ${openings.length} openings into database`);
}
