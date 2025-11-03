// Opening descriptions database
// Maps opening names to informative descriptions

export const openingDescriptions: Record<string, string> = {
  // Ruy Lopez / Spanish Opening
  "Ruy Lopez": "One of the strongest and most popular openings. White attacks the e5 pawn with the knight, forcing Black to make a decision about defending it. A classical opening with rich strategic possibilities.",
  "Ruy Lopez: Open": "The main line where Black plays 3...a6. After 4.Ba4 Nf6 5.0-0 Be7, this is one of the most popular and well-researched positions in chess with balanced play.",
  "Ruy Lopez: Closed": "Black plays 3...a6 4.Ba4 Nf6 5.0-0 Be7 without playing d5, leading to closed positions with long-term strategic battles and pawn structure importance.",
  "Ruy Lopez: Berlin Defense": "Black counters with 3...Nf6, which has become very popular at the highest levels. It leads to sharp middlegames or closed technical positions with unique pawn structures.",
  "Ruy Lopez: Morphy Defense": "The main line of the Open Ruy Lopez with 3...a6 4.Ba4 Nf6 5.0-0 Be7 6.Re1 b5 7.Bb3. White maintains pressure while Black seeks counterplay.",
  "Ruy Lopez: Norwegian Variation": "An unusual defense where Black plays an early g6, preparing fianchetto ideas and creating a flexible position.",
  "Ruy Lopez: Schliemann Defense": "Black plays 3...f5, immediately counterattacking White's center. This leads to sharp tactical positions with mutual attacking chances.",
  
  // Italian Game
  "Italian Game": "A classical opening where both sides develop quickly with control of the center. White usually plays 3.Bc4, targeting the weak f7 pawn and establishing piece activity.",
  "Italian Game: Two Knights Defense": "Black plays 2...Nf6, leading to sharp tactical play. The position can quickly become very complicated with tactical opportunities for both sides.",
  "Italian Game: Two Knights Defense: Fried Liver": "An aggressive variation where White sacrifices the knight on d5 to create a dangerous attack against the Black king. Named for its explosive nature.",
  "Italian Game: Two Knights Defense: Traxler Counterattack": "Black sacrifices the e4 pawn to create immediate counterplay. This leads to wild, tactical positions.",
  "Italian Game: Giuoco Piano": "A solid continuation for both sides with 3...Bc5. The opening tends to be less sharp than the Two Knights Defense but still offers rich play.",
  "Italian Game: Giuoco Pianissimo": "An ultra-solid approach where White plays 4.d3, avoiding the sharp main lines. This leads to strategic maneuvering and solid positions.",
  "Italian Game: Evans Gambit": "White sacrifices the b4 pawn early to gain rapid piece development and create attacking chances.",
  
  // Sicilian Defense - The most popular and complex opening
  "Sicilian Defense": "Black's most popular response to 1.e4. By playing 1...c5, Black immediately attacks the center and fights for the initiative.",
  "Sicilian: Open": "White plays 3.d4 cxd4 4.Nxd4, leading to the mainlines where White maintains a space advantage.",
  "Sicilian: Closed": "White avoids 3.d4 and plays Nc3, leading to positions where White can build up slowly with f4 and kingside attacks.",
  "Sicilian: Najdorf": "A flexible and solid response by Black with 5...e6 and 6...Nbd7. One of the most respected defenses against 1.e4 at all levels.",
  "Sicilian: Najdorf: English Attack": "White plays 6.Be3 and f4, creating a flexible pawn structure and avoiding the sharpest theoretical positions.",
  "Sicilian: Najdorf: Main Line": "The critical theoretical line where White plays 6.Bg5, leading to sharp positions with opposite-side castling.",
  "Sicilian: Dragon": "An aggressive defense where Black plays 5...g6, followed by Bg7 to control the long diagonal. Very popular at club and master level.",
  "Sicilian: Dragon: Classical": "White plays 6.Be3, leading to strategic struggles where both sides play for long-term plans.",
  "Sicilian: Dragon: Yugoslav Attack": "White plays 6.Bg5, leading to some of the sharpest positions in chess with both sides attacking.",
  "Sicilian: Taimanov": "A solid continuation with 5...e6 and 6...e5, leading to a restrained but flexible position for Black.",
  "Sicilian: Sveshnikov": "Black plays 5...e5, immediately addressing the center. This leads to dynamic play with chances for both sides and rapid piece activity.",
  "Sicilian: Classical": "A solid choice with 5...e6, preparing to develop pieces naturally. Often transposes to other Sicilian variations.",
  "Sicilian: Positional": "White avoids sharp main lines and plays positionally, trying to build up a slow advantage through superior pawn structure.",
  "Sicilian: Giri Variation": "A modern approach to the Sicilian by White, avoiding the main theoretical battles.",
  
  // French Defense
  "French Defense": "Black plays 1...e6, establishing a solid pawn structure. This opening is characterized by long-term positional maneuvering and strategic depth.",
  "French: Winawer": "A sharp variation where Black plays 4...Bb4, immediately challenging White's center. It leads to lively middlegames with tactical opportunities.",
  "French: Winawer: Main Line": "The critical line where White plays 5.a3, forcing Black to make an immediate decision about the bishop.",
  "French: Winawer: Positional Line": "White plays 5.Nf3, avoiding sharp forcing variations and maintaining flexibility.",
  "French: Classical": "Black develops without the early bishop check with 4...dxe4. This leads to more positional play with a solid pawn structure.",
  "French: Tarrasch": "White plays 3.Nd2, supporting the e4 pawn and avoiding the Winawer Variation. It leads to flexible positions.",
  "French: Tarrasch: Closed": "White plays d4 and avoids early pawn exchanges, leading to long-term maneuvering games.",
  "French: Tarrasch: Open": "White allows the f6 pawn to be played, leading to more open positions with piece play.",
  "French: Scandinavian Variation": "A rare continuation where White plays 3.f4, creating an unusual pawn structure.",
  "French: Rubinstein Variation": "White plays 4.Nf3 immediately, avoiding the Winawer positions.",
  
  // Caro-Kann Defense
  "Caro-Kann Defense": "Black's solid alternative to the French. After 1...c6, Black supports the d5 advance, maintaining a strong pawn structure.",
  "Caro-Kann: Classical": "Black plays 3...Nf6 and 4...dxe4, leading to balanced positions with strategic complexity and piece play.",
  "Caro-Kann: Main Line": "The critical variation where White plays 3.Nc3 and Black responds with 3...dxe4. Rich in tactical possibilities.",
  "Caro-Kann: Advance Variation": "White maintains the pawn on e4 and plays e5, establishing space. Black must find accurate counterplay.",
  "Caro-Kann: Two Knights Variation": "White plays 3.Nf3 Nf6 4.e5, leading to a sharp struggle for space.",
  "Caro-Kann: Slav Variation": "Black plays 3...Nf6 4.e5 Ne4, fighting for the center immediately.",
  
  // Scandinavian Defense
  "Scandinavian Defense": "An aggressive response to 1.e4 with 1...d5, immediately challenging the center. Less popular but playable.",
  "Scandinavian: Main Line": "Black immediately takes on e4 with 2...dxe4, leading to open positions with tactical opportunities.",
  "Scandinavian: Portuguese Variation": "Black plays 1...d5 2.exd5 Qxd5 3.Nc3 Qa5, maintaining flexibility.",
  
  // Pirc Defense
  "Pirc Defense": "Black plays 1...d6 and 2...Nf6, preparing to fianchetto the kingside bishop. It's solid and flexible with modern ideas.",
  "Pirc: Classical": "White plays 3.Nc3 and avoids f4, leading to strategic positions where Black can counterattack.",
  "Pirc: Aggressive": "White plays 3.f4 immediately, establishing space and central control.",
  
  // Modern Defense
  "Modern Defense": "Black plays 1...g6 and 2...Bg7, immediately establishing a fianchettoed position. It's flexible and allows Black to adapt to White's setup.",
  
  // Alekhine's Defense
  "Alekhine's Defense": "A provocative opening where Black plays 1...Nf6, attacking the e4 pawn. Black accepts a displaced knight to provoke White's pawns.",
  "Alekhine: Modern Variation": "Black continues with ...e6 and ...c5, fighting for the center. A modern approach with flexible piece placement.",
  "Alekhine: Main Line": "White pushes forward with 4.e5 Ne8, leading to a unique strategic battle.",
  
  // Philidor Defense
  "Philidor Defense": "Black plays 1...e5 and 2...d6, supporting the e5 pawn from behind. A solid but somewhat passive defense.",
  "Philidor: Main Line": "Black plays 3...Nf6 and maintains the center, waiting for White to commit first.",
  
  // Petrov's Defense
  "Petrov's Defense": "A solid and symmetrical defense where Black mirrors White's moves with 1...e5 and 2...Nf6. Solid but often leads to drawish positions.",
  "Petrov: Classical": "The main line leading to classical positions with balanced chances for both sides.",
  "Petrov: Aggressive": "White plays 4.Nxe5, accepting the central tension for active piece play.",
  
  // Queen's Gambit and Related
  "Queen's Gambit": "White's main alternative to 1.e4. By playing 1.d4 d5 2.c4, White offers a pawn to gain time and seize the initiative.",
  "Queen's Gambit: Accepted": "Black accepts the gambit with 2...dxc4. This leads to sharp positions where White tries to regain the pawn with advantage.",
  "Queen's Gambit: Accepted: Main Line": "White plays 3.Nf3 a6, developing while maintaining the material advantage.",
  "Queen's Gambit: Declined": "Black refuses the gambit and maintains the tension. This leads to strategic, long-term maneuvering.",
  "Queen's Gambit: Declined: Orthodox Defense": "Black plays 2...e6 and 3...Nf6, establishing a solid pawn structure.",
  "Queen's Gambit: Declined: Semi-Orthodox": "Black plays 2...c6 and 3...Nf6, preparing d5 with a flexible approach.",
  "Queen's Gambit: Declined: Slav Defense": "Black plays 2...c6, supporting the center without blocking the c-file. A solid and flexible defense.",
  "Queen's Gambit: Declined: Semi-Slav": "Black plays 2...c6 and 3...e6, combining elements of both setups.",
  "Queen's Gambit: Declined: Modern Slav": "Black plays with ...a6 and ...b5, creating queenside counterplay.",
  
  // Benko Gambit
  "Benko Gambit": "White plays 1.d4 Nf6 2.c4 c5 3.d5 b5, sacrificing the b-pawn for long-term queenside counterplay.",
  "Benko Gambit: Main Line": "Black obtains active piece play and queenside expansion after the pawn sacrifice.",
  
  // Indian Defenses
  "King's Indian Defense": "Black plays 1...Nf6 and 2...g6, preparing to fianchetto the bishop. One of the most popular defenses to 1.d4.",
  "King's Indian: Classical": "Black plays 3...Bg7 and develops naturally. This leads to rich middlegames with chances for both sides.",
  "King's Indian: Fianchetto": "White also fianchettoes the kingside bishop with g3, leading to a tense but balanced struggle.",
  "King's Indian: Sämisch": "White plays 3.f3, creating a solid pawn base for e4. This leads to strategic battles.",
  "King's Indian: Four Pawns": "White plays 3.c4 and f4, establishing maximum space. Black must find precise counterplay.",
  "King's Indian: Real Madrid Variation": "A modern approach with 3.c4 g6 4.Nc3 Bg7 5.Nf3 0-0 6.Be2.",
  
  "Nimzo-Indian Defense": "Black plays 3...Bb4, immediately pinning the knight. This is a solid and resourceful defense to 1.d4.",
  "Nimzo-Indian: Classical": "Black plays 4...Bxc3+ 5.bxc3, leading to a doubled pawn structure for White.",
  "Nimzo-Indian: Rubinstein": "Black plays 4...0-0, maintaining the pin and creating dynamic counterplay.",
  "Nimzo-Indian: Samisch": "White plays 3.Nc3, avoiding the immediate pin.",
  
  "Queen's Indian Defense": "Black plays 1...Nf6, 2...e6, and 3...b6, preparing to fianchetto the queenside bishop.",
  "Queen's Indian: Main Line": "Black plays 4...Ba6, challenging White's setup immediately.",
  "Queen's Indian: Flexible": "Black avoids early commitments and waits for White to declare his intentions.",
  
  "Grünfeld Defense": "Black plays 1...d4 Nf6 2.c4 g6 3.Nc3 d5, immediately challenging White's center.",
  "Grünfeld: Classical": "Black plays 3...d5 4.cxd5 Nxd5, leading to open middlegame positions.",
  "Grünfeld: Russian System": "White plays 5.cxd5 Nxd5 6.e4, establishing a strong center.",
  "Grünfeld: Exchange Variation": "White takes on d5 early, leading to strategic positions with specific pawn structures.",
  
  "Catalan Opening": "White plays 1.d4 Nf6 2.c4 e6 3.g3, combining elements of the Queen's Gambit with kingside fianchetto.",
  "Catalan: Open": "Black plays 3...d5, immediately challenging White's center.",
  "Catalan: Closed": "Black avoids taking on c4, leading to strategic battles with the e6 pawn firmly placed.",
  
  // Flank Openings
  "English Opening": "White plays 1.c4, avoiding the main theoretical battles and establishing a strategic struggle from the start.",
  "English: Symmetrical": "Black responds with 1...c5, creating a symmetrical pawn structure.",
  "English: Asymmetrical": "Black plays a different second move, creating imbalanced positions.",
  
  "Reti Opening": "White plays 1.Nf3, preparing to control the center with pawns from a distance. A hypermodern approach.",
  "Reti: Main Line": "White follows with c4 and d4 or g3, establishing a flexible setup.",
  
  "Bird's Opening": "White plays 1.f4, establishing an immediate fianchetto structure on the kingside.",
  "Bird: Main Line": "Black responds to White's setup, leading to interesting strategic battles.",
  
  // 1.d4 Alternatives
  "Colle System": "White plays 1.d4 Nf6 2.Nf3 d5 3.c3, preparing e3 and Be2. This is a solid positional setup.",
  "Colle System: Main Line": "Black develops with dxc4 and e6, leading to a structured middlegame.",
  
  "London System": "A solid setup where White plays d4, Nf3, c3, e3, Bd3, and Nbd2. This is reliable and strategically sound.",
  "London System: Flexible": "White adjusts the setup based on Black's response, maintaining flexibility.",
  
  // Gambits
  "King's Gambit": "White plays 1.e4 e5 2.f4, immediately sacrificing a pawn for rapid development and attacking chances.",
  "King's Gambit: Accepted": "Black takes the pawn with 2...exf4, leading to sharp attacking positions for White.",
  "King's Gambit: Declined": "Black declines the gambit, maintaining central control.",
  "King's Gambit: Classical": "Black plays 2...exf4 3.Bc4 followed by natural development.",
  "King's Gambit: Kieseritzky": "An unusual defense where Black doesn't immediately develop.",
  
  "Evans Gambit": "White plays 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4, sacrificing a pawn for rapid piece development.",
  "Evans Gambit: Accepted": "Black takes the pawn, and White generates attacking chances.",
  "Evans Gambit: Declined": "Black declines, leading to more positional positions.",
  
  "Danish Gambit": "White plays 1.d4 d5 2.c4 dxc4 3.e3, sacrificing a pawn for rapid piece development.",
  
  "Budapest Defense": "Black plays 1.d4 Nf6 2.c4 e5, sacrificing the e5 pawn for counterplay.",
  "Budapest Defense: Main Line": "White plays 3.dxe5, accepting the pawn and the resulting complications.",
  "Budapest Defense: Closed": "White declines the pawn and maintains a solid position.",
  
  "Albin Counter-Gambit": "Black plays 1.d4 d5 2.c4 e5, immediately counterattacking White's pawn on d4.",
  
  // Rare and Unusual Openings
  "Orangutan Opening": "White plays 1.b4, immediately creating queenside space. Unusual but playable.",
  
  "Sokolsky Opening": "White plays 1.b4, similar ideas to the Orangutan Opening.",
  
  "Hippopotamus Defense": "Black establishes a solid formation with a6, e6, Nf6, and f6, creating a fortress-like structure.",
  
  "Benoni Defense": "Black plays 1.d4 Nf6 2.c4 c5, immediately challenging White's center.",
  "Benoni: Modern": "Black plays ...e6 and ...cxd4, leading to open positions.",
  "Benoni: Czech Variation": "Black plays ...b6, adding queenside expansion to the setup.",
  
  "Polish Opening": "White plays 1.b4, creating immediate queenside space.",
  
  "Gunderam Defense": "An unusual and rarely played opening.",
  
  // Endgame Classifications
  "Pawn Endgame": "A theoretical position where all pieces except pawns and kings have been traded. These require precise technique.",
  "King and Pawn Endgame": "The fundamental endgame involving only pawns and kings, requiring knowledge of key squares and opposition.",
  
  // Transpositions and Special Openings
  "Unusual Opening": "An opening that doesn't fit into the standard classifications, often leading to unique positions.",
  "Position": "A general term for any chess position reached through various move orders.",
};

export function getOpeningDescription(openingName: string): string | null {
  if (!openingName) return null;
  
  // Try exact match first
  if (openingDescriptions[openingName]) {
    return openingDescriptions[openingName];
  }
  
  // Try case-insensitive match
  for (const [key, value] of Object.entries(openingDescriptions)) {
    if (key.toLowerCase() === openingName.toLowerCase()) {
      return value;
    }
  }
  
  // Try partial match (for variations)
  for (const [key, value] of Object.entries(openingDescriptions)) {
    if (openingName.includes(key) || key.includes(openingName)) {
      return value;
    }
  }
  
  return null;
}
