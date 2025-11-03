// Opening descriptions database
// Maps opening names to informative descriptions

export const openingDescriptions: Record<string, string> = {
  // Ruy Lopez
  "Ruy Lopez": "One of the strongest and most popular openings. White attacks the e5 pawn with the knight, forcing Black to make a decision about defending it. A classical opening with rich strategic possibilities.",
  "Ruy Lopez: Open": "The main line where Black plays 3...a6. After 4.Ba4 Nf6 5.0-0 Be7, White faces a well-researched position with balanced play.",
  "Ruy Lopez: Closed": "Black plays 3...a6 4.Ba4 Nf6 5.0-0 Be7 without playing ...d5, leading to closed positions with long-term strategic battles.",
  "Ruy Lopez: Berlin Defense": "Black counters with 3...Nf6, which has become very popular at the highest levels. It leads to sharp middlegames or closed technical positions.",

  // Italian Game
  "Italian Game": "A classic opening where both sides develop quickly with control of the center. White usually plays 3.Bc4, targeting the weak f7 pawn.",
  "Italian Game: Two Knights Defense": "Black plays 2...Nf6, leading to sharp tactical play. The position can quickly become very complicated.",
  "Italian Game: Two Knights Defense: Fried Liver": "An aggressive variation where White sacrifices the knight on d5 to create a dangerous attack against the Black king.",
  "Italian Game: Giuoco Piano": "A solid continuation for both sides with 3...Bc5. The opening tends to be less sharp than the Two Knights Defense.",

  // Sicilian Defense
  "Sicilian Defense": "Black's most popular response to 1.e4. By playing 1...c5, Black immediately attacks the center and fights for the initiative.",
  "Sicilian: Najdorf": "A flexible and solid response by Black with 5...e6 and 6...Nbd7. It's one of the most respected defenses against 1.e4.",
  "Sicilian: Dragon": "An aggressive defense where Black plays 5...g6, followed by Bg7 to control the long diagonal. Very popular in club and master level.",
  "Sicilian: Taimanov": "A solid continuation with 5...e6 and 6...e5, leading to a restrained but flexible position for Black.",
  "Sicilian: Sveshnikov": "Black plays 5...e5, immediately addressing the center. This leads to dynamic play with chances for both sides.",
  "Sicilian: Classical": "A solid choice with 5...e6, preparing to develop pieces naturally. It often transposes to other Sicilian variations.",

  // French Defense
  "French Defense": "Black plays 1...e6, establishing a solid pawn structure. This opening is characterized by long-term positional maneuvering.",
  "French: Winawer": "A sharp variation where Black plays 4...Bb4, immediately challenging White's center. It leads to lively middlegames.",
  "French: Classical": "Black develops without the early bishop check with 4...dxe4. This leads to more positional play.",
  "French: Tarrasch": "White plays 3.Nd2, supporting the e4 pawn and avoiding the Winawer Variation. It leads to flexible positions.",

  // Caro-Kann Defense
  "Caro-Kann Defense": "Black's solid alternative to the French. After 1...c6, Black supports the d5 advance, maintaining a strong pawn structure.",
  "Caro-Kann: Classical": "Black plays 3...Nf6 and 4...dxe4, leading to balanced positions with strategic complexity.",
  "Caro-Kann: Main Line": "The critical variation where White plays 3.Nc3 and Black responds with 3...dxe4. It's rich in tactical possibilities.",

  // Scandinavian Defense
  "Scandinavian Defense": "An aggressive response to 1.e4 with 1...d5, immediately challenging the center. Less popular but playable.",

  // Queen's Pawn Openings
  "Queen's Gambit": "White's main alternative to 1.e4. By playing 1.d4 d5 2.c4, White offers a pawn to gain time and seize the initiative.",
  "Queen's Gambit: Accepted": "Black accepts the gambit with 2...dxc4. This leads to sharp positions where White tries to regain the pawn with advantage.",
  "Queen's Gambit: Declined": "Black refuses the gambit and maintains the tension. This leads to strategic, long-term maneuvering.",
  "Queen's Gambit: Slav Defense": "Black plays 2...c6, supporting the center without blocking the c-file. A solid and flexible defense.",
  "Queen's Gambit: Semi-Slav": "Black plays 2...c6 and ...e6, combining elements of the Slav and Orthodox defense.",
  "Queen's Gambit: Orthodox Defense": "Black plays 2...e6 and ...Nf6, establishing a solid pawn structure.",

  // Indian Defenses
  "King's Indian Defense": "Black plays 1...Nf6 and 2...g6, preparing to fianchetto the bishop. This is one of the most popular defenses to 1.d4.",
  "King's Indian: Classical": "Black plays 3...Bg7 and develops naturally. This leads to rich middlegames with chances for both sides.",
  "King's Indian: Fianchetto": "White also fianchettoes the kingside bishop, leading to a tense but balanced struggle.",
  "Nimzo-Indian Defense": "Black plays 3...Bb4, immediately pinning the knight. This is a solid and resourceful defense to 1.d4.",
  "Queen's Indian Defense": "Black plays 1...Nf6, 2...e6, and 3...b6, preparing to fianchetto the queenside bishop.",

  // Petrov's Defense
  "Petrov's Defense": "A solid and symmetrical defense where Black mirrors White's moves with 1...e5 and 2...Nf6. It's solid but drawish.",
  "Petrov: Classical": "The main line leading to classical positions with chances for both sides.",

  // Philidor Defense
  "Philidor Defense": "Black plays 1...e5 and 2...d6, supporting the e5 pawn from behind. A solid but somewhat passive defense.",

  // Alekhine's Defense
  "Alekhine's Defense": "A provocative opening where Black plays 1...Nf6, attacking the e4 pawn. Black accepts a displaced knight position to provoke White's pawns.",
  "Alekhine: Modern": "Black continues with ...e6 and ...c5, fighting for the center. A modern approach to Alekhine's Defense.",

  // Uncommon openings
  "Pirc Defense": "Black plays 1...d6 and 2...Nf6, preparing to fianchetto the kingside bishop. It's solid and flexible.",
  "Pawn Endgame": "A theoretical position where all pieces except pawns and kings have been traded. These require precise technique.",
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
