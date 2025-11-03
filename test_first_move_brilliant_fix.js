// Test to verify that the first move is NOT marked as brilliant

function cpToWinProbability(cp) {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

function labelMove(userMove, engineMove, E_after_played, E_after_best, isBookMove, playerColor, isMate) {
  if (isBookMove) return 'book';

  // IMPORTANT: Both evaluations are from White's perspective
  // Positive = White advantage, Negative = Black advantage
  
  // Calculate delta_cp (centipawn loss from player's perspective)
  // For White: delta_cp = E_after_best - E_after_played
  // For Black: delta_cp = (-E_after_best) - (-E_after_played) = E_after_played - E_after_best
  let delta_cp;
  if (playerColor === 'w') {
    delta_cp = (E_after_best - E_after_played) * 100;
  } else {
    // For Black, we need to invert because lower (more negative) is better for Black
    delta_cp = (E_after_played - E_after_best) * 100;
  }
  
  // Convert to win probabilities for scale-invariant comparison
  // Note: cp must be from the player's perspective for proper probability calculation
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
  
  // Special case: Mate scores
  if (isMate || Math.abs(E_after_best) >= 90 || Math.abs(E_after_played) >= 90) {
    const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
    const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
    
    // Lost a forced mate (had mate, now don't)
    if (playerBestEval >= 9.0 && playerPlayedEval < 0) {
      return 'blunder';
    }
    
    // Missed a forced mate (had mate, now only winning)
    if (playerBestEval >= 9.0 && playerPlayedEval >= 0 && playerPlayedEval < 3.0) {
      return 'miss';
    }
    
    // Found the only saving move from getting mated
    if (userMove === engineMove && playerBestEval >= -0.5 && playerPlayedEval >= -0.5) {
      // Best move saves from mate, and player found it
      return 'brilliant';
    }
  }
  
  // Brilliant move detection
  const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
  const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
  
  // Key criterion: Cannot be brilliant if already in a winning position
  // Brilliant moves must convert difficult/equal positions into winning ones
  // If already winning, it's just a good move (best, excellent, or good)
  const wasAlreadyWinning = playerBestEval >= 2.0; // Already significantly winning (2+ pawns)
  
  // Brilliant criteria 1: Saved a lost position
  // Position was losing badly, now it's drawable/holdable
  if (!wasAlreadyWinning && playerPlayedEval >= -0.5 && playerBestEval < -1.5 && delta_cp < 25) {
    return 'brilliant';
  }
  
  // Brilliant criteria 2: Sacrifice leading to great advantage
  const evalImprovement = playerPlayedEval - playerBestEval;
  const isSignificantGain = evalImprovement >= 2.0;
  const isCloseToOrBetterThanEngine = delta_cp <= 15;
  
  if (!wasAlreadyWinning && isSignificantGain && isCloseToOrBetterThanEngine && playerPlayedEval >= 1.5) {
    return 'brilliant';
  }
  
  // Brilliant criteria 3: Only move that maintains balance/saves position
  // Position must be genuinely sharp/critical: close to 0, not already good
  if (!wasAlreadyWinning && userMove === engineMove && playerBestEval <= 0.1 && playerBestEval >= -0.3 && delta_cp < 5) {
    const positionWasCritical = Math.abs(E_after_best) < 0.5 && Math.abs(E_after_played) < 0.5;
    if (positionWasCritical) {
      return 'brilliant';
    }
  }
  
  // Best move: Player played what the engine recommended
  if (userMove === engineMove) {
    return 'best';
  }
  
  // Apply dual thresholds (centipawn OR win-probability, whichever is more lenient)
  
  // Blunder: Decisive error (ΔP ≥ 30% OR Δcp ≥ 300)
  if (delta_p >= 0.30 || delta_cp >= 300) {
    return 'blunder';
  }
  
  // Mistake: Major error (ΔP ≥ 20% OR Δcp ≥ 100)
  if (delta_p >= 0.20 || delta_cp >= 100) {
    return 'mistake';
  }
  
  // Inaccuracy: Noticeable slip (ΔP ≥ 10% OR Δcp ≥ 50)
  if (delta_p >= 0.10 || delta_cp >= 50) {
    return 'inaccuracy';
  }
  
  // Good: Minor acceptable loss (ΔP ≥ 5% OR Δcp ≥ 25)
  if (delta_p >= 0.05 || delta_cp >= 25) {
    return 'good';
  }
  
  // Excellent: Very slight loss (ΔP ≥ 2% OR Δcp ≥ 10)
  if (delta_p >= 0.02 || delta_cp >= 10) {
    return 'excellent';
  }
  
  // Near-perfect or equal to best
  return 'best';
}

console.log('Testing First Move Brilliant Fix');
console.log('================================\n');

const testCases = [
  {
    name: 'First move: e4 (book move) - Should be BOOK',
    userMove: 'e2e4',
    engineMove: 'e2e4',
    E_after_played: 0.25,
    E_after_best: 0.25,
    isBookMove: true,
    playerColor: 'w',
    expected: 'book',
    description: 'When book move is properly detected, it should return "book"'
  },
  {
    name: 'First move: e4 (not detected as book) - Should be BEST, not brilliant',
    userMove: 'e2e4',
    engineMove: 'e2e4',
    E_after_played: 0.25,
    E_after_best: 0.25,
    isBookMove: false,
    playerColor: 'w',
    expected: 'best',
    shouldNotBe: 'brilliant',
    description: 'First move is the best move, but should NOT be marked brilliant'
  },
  {
    name: 'Opening move: Nf3 (not best, 25cp loss) - Should be GOOD, not brilliant',
    userMove: 'g1f3',
    engineMove: 'd2d4',
    E_after_played: 0.15,
    E_after_best: 0.40,
    isBookMove: false,
    playerColor: 'w',
    expected: 'good',
    shouldNotBe: 'brilliant',
    description: 'Good opening move but not engine best - should be "good"'
  },
  {
    name: 'Different move same eval as engine - Should be BEST, not brilliant',
    userMove: 'c4d5',
    engineMove: 'e2e3',
    E_after_played: 0.25,
    E_after_best: 0.24,
    isBookMove: false,
    playerColor: 'w',
    expected: 'best',
    shouldNotBe: 'brilliant',
    description: 'Player finds equally good alternative move - labeled as best'
  },
  {
    name: 'Precise defense in sharp position - Should be BRILLIANT',
    userMove: 'b8c6',
    engineMove: 'b8c6',
    E_after_played: 0.15,
    E_after_best: 0.15,
    isBookMove: false,
    playerColor: 'b',
    expected: 'brilliant',
    shouldBe: 'brilliant',
    description: 'Only move in sharp position that keeps balance - brilliant'
  },
  {
    name: 'Winning position, good move - Should be BEST, not brilliant',
    userMove: 'f1e1',
    engineMove: 'f1e1',
    E_after_played: 3.50,
    E_after_best: 3.50,
    isBookMove: false,
    playerColor: 'w',
    expected: 'best',
    shouldNotBe: 'brilliant',
    description: 'In a winning position (3.5+), best moves are not brilliant'
  },
  {
    name: 'Already winning, move keeps advantage - Should be BEST, not brilliant',
    userMove: 'a1a2',
    engineMove: 'a1a2',
    E_after_played: 2.75,
    E_after_best: 2.75,
    isBookMove: false,
    playerColor: 'w',
    expected: 'best',
    shouldNotBe: 'brilliant',
    description: 'Position already winning (2.75), move cannot be brilliant'
  }
];

let passed = 0;
let failed = 0;
let issues = [];

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
  
  const isPass = result === test.expected;
  const notWrongLabel = !test.shouldNotBe || result !== test.shouldNotBe;
  const rightLabel = !test.shouldBe || result === test.shouldBe;
  
  const success = isPass && notWrongLabel && rightLabel;
  
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Description: ${test.description}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  
  if (test.shouldNotBe && result === test.shouldNotBe) {
    console.log(`  ✗ FAIL: Incorrectly marked as "${test.shouldNotBe}"`);
    issues.push(`Test ${index + 1}: Should NOT be "${test.shouldNotBe}"`);
  } else if (test.shouldBe && result !== test.shouldBe) {
    console.log(`  ✗ FAIL: Should be "${test.shouldBe}", got "${result}"`);
    issues.push(`Test ${index + 1}: Should be "${test.shouldBe}"`);
  } else if (!success) {
    console.log(`  ✗ FAIL`);
    issues.push(`Test ${index + 1}: Expected "${test.expected}", got "${result}"`);
  } else {
    console.log(`  ✓ PASS`);
  }
  
  console.log();
  
  if (success) passed++;
  else failed++;
});

console.log('================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

if (failed === 0) {
  console.log('✓ All tests passed!');
  console.log('✓ First move is no longer marked as brilliant');
  console.log('✓ Brilliant moves only trigger for non-winning positions');
  console.log('✓ Book move detection works correctly');
  process.exit(0);
} else {
  console.log('✗ Some tests failed:');
  issues.forEach(issue => console.log(`  - ${issue}`));
  process.exit(1);
}
