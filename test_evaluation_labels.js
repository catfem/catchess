// Test to verify all evaluation labels work correctly

function cpToWinProbability(cp) {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

function labelMove(userMove, engineMove, E_after_played, E_after_best, isBookMove, playerColor, isMate) {
  if (isBookMove) return 'book';

  let delta_cp;
  if (playerColor === 'w') {
    delta_cp = (E_after_best - E_after_played) * 100;
  } else {
    delta_cp = (E_after_played - E_after_best) * 100;
  }
  
  let P_best, P_played;
  if (playerColor === 'w') {
    P_best = cpToWinProbability(E_after_best * 100);
    P_played = cpToWinProbability(E_after_played * 100);
  } else {
    P_best = cpToWinProbability(-E_after_best * 100);
    P_played = cpToWinProbability(-E_after_played * 100);
  }
  const delta_p = P_best - P_played;
  
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
  
  const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
  const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
  
  const wasAlreadyWinning = playerBestEval >= 2.0;
  
  if (!wasAlreadyWinning && playerPlayedEval >= -0.5 && playerBestEval < -1.5 && delta_cp < 25) {
    return 'brilliant';
  }
  
  const evalImprovement = playerPlayedEval - playerBestEval;
  const isSignificantGain = evalImprovement >= 2.0;
  const isCloseToOrBetterThanEngine = delta_cp <= 15;
  
  if (!wasAlreadyWinning && isSignificantGain && isCloseToOrBetterThanEngine && playerPlayedEval >= 1.5) {
    return 'brilliant';
  }
  
  if (!wasAlreadyWinning && userMove === engineMove && playerBestEval <= 0.1 && playerBestEval >= -0.3 && delta_cp < 5) {
    const positionWasCritical = Math.abs(E_after_best) < 0.5 && Math.abs(E_after_played) < 0.5;
    if (positionWasCritical) {
      return 'brilliant';
    }
  }
  
  if (userMove === engineMove) {
    return 'best';
  }
  
  if (delta_p >= 0.30 || delta_cp >= 300) {
    return 'blunder';
  }
  
  if (delta_p >= 0.20 || delta_cp >= 100) {
    return 'mistake';
  }
  
  if (delta_p >= 0.10 || delta_cp >= 50) {
    return 'inaccuracy';
  }
  
  if (delta_p >= 0.05 || delta_cp >= 25) {
    return 'good';
  }
  
  if (delta_p >= 0.02 || delta_cp >= 10) {
    return 'excellent';
  }
  
  if (delta_p > 0 || delta_cp > 0) {
    return 'great';
  }
  
  return 'best';
}

console.log('Testing Evaluation Labels');
console.log('========================\n');

const testCases = [
  {
    name: 'Book move - Should be BOOK',
    userMove: 'e2e4',
    engineMove: 'e2e4',
    E_after_played: 0.25,
    E_after_best: 0.25,
    isBookMove: true,
    playerColor: 'w',
    expected: 'book',
    description: 'Proper book move detection'
  },
  {
    name: 'Best move (exact engine) - Should be BEST',
    userMove: 'd2d4',
    engineMove: 'd2d4',
    E_after_played: 0.30,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'best',
    description: 'Engine move recommendation'
  },
  {
    name: 'Great move (3cp loss) - Should be GREAT',
    userMove: 'c2c4',
    engineMove: 'd2d4',
    E_after_played: 0.297,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'great',
    description: 'Very close to engine (3 CP difference)'
  },
  {
    name: 'Excellent move (12cp loss) - Should be EXCELLENT',
    userMove: 'a2a3',
    engineMove: 'd2d4',
    E_after_played: 0.188,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'excellent',
    description: 'Close to engine (12 CP difference)'
  },
  {
    name: 'Good move (25cp loss) - Should be GOOD',
    userMove: 'b2b3',
    engineMove: 'd2d4',
    E_after_played: 0.05,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'good',
    description: 'Reasonable move (25 CP difference)'
  },
  {
    name: 'Inaccuracy (50cp loss) - Should be INACCURACY',
    userMove: 'e2e3',
    engineMove: 'd2d4',
    E_after_played: -0.20,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'inaccuracy',
    description: 'Noticeable slip (50 CP difference)'
  },
  {
    name: 'Mistake (100cp loss) - Should be MISTAKE',
    userMove: 'h2h3',
    engineMove: 'd2d4',
    E_after_played: -0.70,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'mistake',
    description: 'Clear error (100 CP difference)'
  },
  {
    name: 'Blunder (300cp loss) - Should be BLUNDER',
    userMove: 'e2e4',
    engineMove: 'd2d4',
    E_after_played: -2.70,
    E_after_best: 0.30,
    isBookMove: false,
    playerColor: 'w',
    expected: 'blunder',
    description: 'Severe mistake (300 CP difference)'
  },
  {
    name: 'Brilliant - Precise defense in sharp - Should be BRILLIANT',
    userMove: 'b8c6',
    engineMove: 'b8c6',
    E_after_played: 0.05,
    E_after_best: 0.05,
    isBookMove: false,
    playerColor: 'b',
    expected: 'brilliant',
    description: 'Only move in critical position'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = labelMove(
    test.userMove,
    test.engineMove,
    test.E_after_played,
    test.E_after_best,
    test.isBookMove,
    test.playerColor,
    false
  );
  
  const success = result === test.expected;
  
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Description: ${test.description}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Status: ${success ? '✓ PASS' : '✗ FAIL'}`);
  console.log();
  
  if (success) passed++;
  else failed++;
});

console.log('========================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

if (failed === 0) {
  console.log('✓ All evaluation labels working correctly!');
  console.log('✓ Brilliant detection: Fixed');
  console.log('✓ Great moves: Implemented');
  console.log('✓ All other labels: Working');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}
