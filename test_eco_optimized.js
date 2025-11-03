// Test the optimized ECO database with common openings

const fs = require('fs');

console.log('Testing Optimized ECO Database');
console.log('==============================\n');

// Load the optimized database
const ecoData = JSON.parse(fs.readFileSync('./public/eco_optimized.json'));

console.log(`Total opening positions: ${Object.keys(ecoData).length}\n`);

// Test with the exact FEN from the test
const testCases = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    label: '1. e4'
  },
  {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    label: '1. e4 e5'
  },
  {
    fen: 'rnbqkbnr/pp1ppppp/8/2p1P3/8/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    label: '1. e4 c5 (Sicilian)'
  },
  {
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2',
    label: '1. d4 d5'
  }
];

console.log('Testing Common Openings:');
let found = 0;
testCases.forEach(test => {
  const entry = ecoData[test.fen];
  if (entry) {
    console.log(`✓ ${test.label}`);
    console.log(`  → ${entry.name} (${entry.eco})`);
    found++;
  } else {
    console.log(`✗ ${test.label} - NOT FOUND`);
    
    // Try to find similar positions
    const matches = Object.entries(ecoData).filter(([fen]) => {
      const parts1 = test.fen.split(' ').slice(0, 2).join(' ');
      const parts2 = fen.split(' ').slice(0, 2).join(' ');
      return parts1 === parts2;
    });
    if (matches.length > 0) {
      console.log(`  (Found ${matches.length} similar positions by piece placement)`);
    }
  }
  console.log();
});

console.log(`Results: ${found}/${testCases.length} common openings found\n`);

// Sample some entries by ECO category
console.log('Sample Entries:');
const sampleFens = Object.entries(ecoData)
  .filter(([, entry]) => entry.src === 'eco_tsv')
  .slice(0, 3);

sampleFens.forEach(([fen, entry]) => {
  console.log(`Opening: ${entry.name}`);
  console.log(`  ECO: ${entry.eco}`);
  console.log(`  Moves: ${entry.moves.substring(0, 40)}...`);
  console.log();
});

console.log('==============================');
console.log(`✓ ECO Optimized Database Ready`);
console.log(`✓ Total positions: ${Object.keys(ecoData).length}`);
