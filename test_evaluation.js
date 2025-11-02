// Test script to validate evaluation conversion logic

// Simulate the conversion logic from stockfish.ts
function convertEvaluation(cp, sideToMove) {
  let evaluation = cp / 100;
  if (sideToMove === 'b') {
    evaluation = -evaluation;
  }
  return evaluation;
}

console.log('Testing Evaluation Conversion from Stockfish');
console.log('==============================================\n');

// Test cases
const testCases = [
  {
    desc: "White to move, Stockfish returns +150 (White advantage)",
    cp: 150,
    side: 'w',
    expected: 1.50,
    meaning: "White is better by 1.50"
  },
  {
    desc: "White to move, Stockfish returns -150 (Black advantage)",
    cp: -150,
    side: 'w',
    expected: -1.50,
    meaning: "Black is better by 1.50"
  },
  {
    desc: "Black to move, Stockfish returns +150 (Black advantage from SF perspective)",
    cp: 150,
    side: 'b',
    expected: -1.50,
    meaning: "Black is better by 1.50 (inverted to White's perspective)"
  },
  {
    desc: "Black to move, Stockfish returns -150 (White advantage from SF perspective)",
    cp: -150,
    side: 'b',
    expected: 1.50,
    meaning: "White is better by 1.50 (inverted to White's perspective)"
  },
  {
    desc: "White to move, Stockfish returns 0 (equal position)",
    cp: 0,
    side: 'w',
    expected: 0.00,
    meaning: "Equal position"
  },
  {
    desc: "Black to move, Stockfish returns 0 (equal position)",
    cp: 0,
    side: 'b',
    expected: 0.00,
    meaning: "Equal position"
  }
];

let allPassed = true;

testCases.forEach((test, index) => {
  const result = convertEvaluation(test.cp, test.side);
  const passed = Math.abs(result - test.expected) < 0.01;
  
  console.log(`Test ${index + 1}: ${test.desc}`);
  console.log(`  Input: cp=${test.cp}, side=${test.side}`);
  console.log(`  Expected: ${test.expected.toFixed(2)}`);
  console.log(`  Result: ${result.toFixed(2)}`);
  console.log(`  Status: ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Meaning: ${test.meaning}`);
  console.log();
  
  if (!passed) allPassed = false;
});

console.log('==============================================');
console.log(`Overall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

console.log('\n\nExplanation:');
console.log('-------------');
console.log('Stockfish returns evaluations from the perspective of the side to move.');
console.log('When it\'s Black\'s turn, a positive score means Black has the advantage.');
console.log('We invert the sign when Black is to move, so our stored evaluations');
console.log('are ALWAYS from White\'s perspective (positive = White better).');
console.log('This ensures consistent display across all UI components.');
