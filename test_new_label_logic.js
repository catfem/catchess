// Test the redefined label logic based on proper engine evaluation comparison

function cpToWinProbability(cp) {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

function labelMove(userMove, engineMove, E_after_played, E_after_best, isBookMove, playerColor, isMate) {
  if (isBookMove) return 'book';

  // Calculate delta_cp (centipawn loss from player's perspective)
  let delta_cp;
  if (playerColor === 'w') {
    delta_cp = (E_after_best - E_after_played) * 100;
  } else {
    // For Black, invert because lower (more negative) is better for Black
    delta_cp = (E_after_played - E_after_best) * 100;
  }
  
  // Convert to win probabilities
  let P_best, P_played;
  if (playerColor === 'w') {
    P_best = cpToWinProbability(E_after_best * 100);
    P_played = cpToWinProbability(E_after_played * 100);
  } else {
    // For Black, invert the evals before calculating probability
    P_best = cpToWinProbability(-E_after_best * 100);
    P_played = cpToWinProbability(-E_after_played * 100);
  }
  const delta_p = P_best - P_played;
  
  // Mate handling
  if (isMate || Math.abs(E_after_best) >= 90 || Math.abs(E_after_played) >= 90) {
    const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
    const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
    
    if (playerBestEval >= 9.0 && playerPlayedEval < 0) {
      return 'blunder';
    }
    if (playerBestEval >= 9.0 && playerPlayedEval >= 0 && playerPlayedEval < 3.0) {
      return 'miss';
    }
    if (userMove === engineMove && playerBestEval >= -0.5 && playerPlayedEval >= -0.5) {
      return 'brilliant';
    }
  }
  
  // Brilliant move detection
  const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
  const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
  
  if (playerPlayedEval >= -0.5 && playerBestEval < -1.5 && delta_cp < 25) {
    return 'brilliant';
  }
  
  if (userMove === engineMove) {
    return 'best';
  }
  
  // Dual thresholds
  if (delta_p >= 0.30 || delta_cp >= 300) return 'blunder';
  if (delta_p >= 0.20 || delta_cp >= 100) return 'mistake';
  if (delta_p >= 0.10 || delta_cp >= 50) return 'inaccuracy';
  if (delta_p >= 0.05 || delta_cp >= 25) return 'good';
  if (delta_p >= 0.02 || delta_cp >= 10) return 'excellent';
  
  return 'best';
}

console.log('Testing Redefined Label Logic');
console.log('==============================\n');

const testCases = [
  {
    name: "White: Best move +2.0, played +1.7 (30cp loss)",
    userMove: 'e2e3',
    engineMove: 'e2e4',
    E_after_played: 1.7,
    E_after_best: 2.0,
    color: 'w',
    expected: 'good',
    expectedDelta: 30
  },
  {
    name: "Black: Best move -2.0, played -1.7 (30cp loss)",
    userMove: 'e7e6',
    engineMove: 'e7e5',
    E_after_played: -1.7,
    E_after_best: -2.0,
    color: 'b',
    expected: 'good',
    expectedDelta: 30
  },
  {
    name: "White: Best move +1.5, played +0.8 (70cp loss)",
    userMove: 'g1f3',
    engineMove: 'd2d4',
    E_after_played: 0.8,
    E_after_best: 1.5,
    color: 'w',
    expected: 'inaccuracy',
    expectedDelta: 70
  },
  {
    name: "Black: Best move -1.5, played -0.8 (70cp loss)",
    userMove: 'd7d6',
    engineMove: 'd7d5',
    E_after_played: -0.8,
    E_after_best: -1.5,
    color: 'b',
    expected: 'inaccuracy',
    expectedDelta: 70
  },
  {
    name: "White: Best move +0.5, played -0.5 (100cp loss)",
    userMove: 'h2h4',
    engineMove: 'g1f3',
    E_after_played: -0.5,
    E_after_best: 0.5,
    color: 'w',
    expected: 'mistake',
    expectedDelta: 100
  },
  {
    name: "Black: Best move -0.5, played +0.5 (100cp loss)",
    userMove: 'a7a5',
    engineMove: 'g8f6',
    E_after_played: 0.5,
    E_after_best: -0.5,
    color: 'b',
    expected: 'mistake',
    expectedDelta: 100
  },
  {
    name: "White: Engine's best move",
    userMove: 'e2e4',
    engineMove: 'e2e4',
    E_after_played: 0.3,
    E_after_best: 0.3,
    color: 'w',
    expected: 'best',
    expectedDelta: 0
  },
  {
    name: "Black: Engine's best move",
    userMove: 'e7e5',
    engineMove: 'e7e5',
    E_after_played: -0.2,
    E_after_best: -0.2,
    color: 'b',
    expected: 'best',
    expectedDelta: 0
  },
  {
    name: "White: Brilliant (saved from -2.0 to -0.3 with 20cp loss)",
    userMove: 'd2d4',
    engineMove: 'g1f3',
    E_after_played: -0.3,
    E_after_best: -1.8,
    color: 'w',
    expected: 'brilliant',
    expectedDelta: -150 // Actually gained!
  },
  {
    name: "Black: Brilliant (saved from +2.0 to +0.3 with 20cp loss)",
    userMove: 'd7d5',
    engineMove: 'g8f6',
    E_after_played: 0.3,
    E_after_best: 1.8,
    color: 'b',
    expected: 'brilliant',
    expectedDelta: -150 // Actually gained!
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  // Calculate expected delta for verification
  let actualDelta;
  if (test.color === 'w') {
    actualDelta = (test.E_after_best - test.E_after_played) * 100;
  } else {
    actualDelta = (test.E_after_played - test.E_after_best) * 100;
  }
  
  const result = labelMove(
    test.userMove,
    test.engineMove,
    test.E_after_played,
    test.E_after_best,
    false,
    test.color,
    false
  );
  
  const isPass = result === test.expected;
  
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  E_after_best: ${test.E_after_best.toFixed(2)}`);
  console.log(`  E_after_played: ${test.E_after_played.toFixed(2)}`);
  console.log(`  Calculated delta_cp: ${actualDelta.toFixed(0)}cp`);
  console.log(`  Expected label: ${test.expected}`);
  console.log(`  Got label: ${result}`);
  console.log(`  Status: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  console.log();
  
  if (isPass) passed++;
  else failed++;
});

console.log('==============================');
console.log(`Results: ${passed}/${testCases.length} passed\n`);

// Check symmetry
console.log('Symmetry Verification:');
console.log('----------------------');
const pairs = [
  [0, 1], [2, 3], [4, 5], [6, 7], [8, 9]
];

let symmetric = true;
pairs.forEach(([whiteIdx, blackIdx]) => {
  const white = testCases[whiteIdx];
  const black = testCases[blackIdx];
  
  const whiteResult = labelMove(white.userMove, white.engineMove, white.E_after_played, white.E_after_best, false, white.color, false);
  const blackResult = labelMove(black.userMove, black.engineMove, black.E_after_played, black.E_after_best, false, black.color, false);
  
  const match = whiteResult === blackResult;
  console.log(`Pair ${pairs.indexOf([whiteIdx, blackIdx]) + 1}: ${whiteResult.padEnd(12)} vs ${blackResult.padEnd(12)} ${match ? '✓' : '✗'}`);
  if (!match) symmetric = false;
});

console.log();
if (symmetric && passed === testCases.length) {
  console.log('✅ SUCCESS: All tests passed with perfect symmetry!');
  console.log('   - White and Black evaluated identically');
  console.log('   - Labels based on proper E_after_best vs E_after_played');
  console.log('   - Dual thresholds (CP and win-probability) working');
} else {
  console.log('❌ FAILURE: Tests failed or asymmetry detected');
}
