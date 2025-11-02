// Test script to validate enhanced move labeling logic

function cpToWinProbability(cp) {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

function labelMove(userMove, engineMove, currentEval, prevEval, isBookMove, playerColor, isMate) {
  if (isBookMove) return 'book';

  const colorMultiplier = playerColor === 'w' ? 1 : -1;
  
  const E_after_played = currentEval * colorMultiplier;
  const E_before = prevEval * colorMultiplier;
  
  const evalChange = E_after_played - E_before;
  const deltaCp = evalChange < 0 ? -evalChange * 100 : 0;
  
  const P_before = cpToWinProbability(E_before * 100);
  const P_played = cpToWinProbability(E_after_played * 100);
  const deltaP = P_before > P_played ? P_before - P_played : 0;
  
  // Handle mate cases
  if (isMate || Math.abs(currentEval) >= 90) {
    if (E_before >= 9.0 && E_after_played < 3.0) {
      return 'miss';
    }
    if (E_before >= 9.0 && E_after_played < 0) {
      return 'blunder';
    }
    if (E_before > -3.0 && E_before < 0.5 && E_after_played < -2.0) {
      return 'miss';
    }
    if (userMove === engineMove && E_after_played >= 0 && E_before < -2.0) {
      return 'brilliant';
    }
  }
  
  // Brilliant move detection
  if (E_after_played >= -0.5 && E_before < -1.5 && deltaCp < 25) {
    return 'brilliant';
  }
  
  if (userMove === engineMove) {
    return 'best';
  }
  
  if (deltaP >= 0.35 || deltaCp >= 300) {
    return 'blunder';
  }
  
  if (deltaP >= 0.20 || deltaCp >= 100) {
    return 'mistake';
  }
  
  if (deltaP >= 0.10 || deltaCp >= 50) {
    return 'inaccuracy';
  }
  
  if (deltaP >= 0.05 || deltaCp >= 25) {
    return 'good';
  }
  
  if (deltaP >= 0.02 || deltaCp >= 10) {
    return 'excellent';
  }
  
  return 'best';
}

console.log('Testing Enhanced Move Labeling Logic');
console.log('=====================================\n');

const testCases = [
  {
    desc: "White plays engine's best move",
    userMove: 'e2e4',
    engineMove: 'e2e4',
    currentEval: 0.35,
    prevEval: 0.30,
    isBook: false,
    color: 'w',
    isMate: false,
    expected: 'best'
  },
  {
    desc: "White plays a move with tiny loss (15cp)",
    userMove: 'e2e3',
    engineMove: 'e2e4',
    currentEval: 0.15,
    prevEval: 0.30,
    isBook: false,
    color: 'w',
    isMate: false,
    expected: 'excellent'
  },
  {
    desc: "Black plays a move with acceptable loss (30cp)",
    userMove: 'e7e6',
    engineMove: 'e7e5',
    currentEval: 0.30,  // White gained, so Black lost
    prevEval: 0.00,
    isBook: false,
    color: 'b',
    isMate: false,
    expected: 'good'
  },
  {
    desc: "White makes an inaccuracy (70cp loss)",
    userMove: 'g1f3',
    engineMove: 'd2d4',
    currentEval: -0.20,
    prevEval: 0.50,
    isBook: false,
    color: 'w',
    isMate: false,
    expected: 'inaccuracy'
  },
  {
    desc: "Black makes a mistake (150cp loss)",
    userMove: 'f6f5',
    engineMove: 'g8f6',
    currentEval: 1.50,
    prevEval: 0.00,
    isBook: false,
    color: 'b',
    isMate: false,
    expected: 'mistake'
  },
  {
    desc: "White blunders (400cp loss)",
    userMove: 'e1e2',
    engineMove: 'e1g1',
    currentEval: -4.00,
    prevEval: 0.00,
    isBook: false,
    color: 'w',
    isMate: false,
    expected: 'blunder'
  },
  {
    desc: "Book move in opening",
    userMove: 'e2e4',
    engineMove: 'e2e4',
    currentEval: 0.25,
    prevEval: 0.20,
    isBook: true,
    color: 'w',
    isMate: false,
    expected: 'book'
  },
  {
    desc: "Brilliant: Saving a lost position",
    userMove: 'd8h4',
    engineMove: 'd8d7',
    currentEval: -0.30,  // Close to equal (Black perspective: +0.30)
    prevEval: 2.50,      // White was winning (Black perspective: -2.50)
    isBook: false,
    color: 'b',
    isMate: false,
    expected: 'brilliant'
  },
  {
    desc: "Missed mate (had M5, now equal)",
    userMove: 'g1h1',
    engineMove: 'g1f3',
    currentEval: 0.00,
    prevEval: 10.00,
    isBook: false,
    color: 'w',
    isMate: true,
    expected: 'miss'
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = labelMove(
    test.userMove,
    test.engineMove,
    test.currentEval,
    test.prevEval,
    test.isBook,
    test.color,
    test.isMate
  );
  
  const isPass = result === test.expected;
  
  console.log(`Test ${index + 1}: ${test.desc}`);
  console.log(`  Player: ${test.color === 'w' ? 'White' : 'Black'}`);
  console.log(`  Eval: ${test.prevEval.toFixed(2)} → ${test.currentEval.toFixed(2)}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Status: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  console.log();
  
  if (isPass) passed++;
  else failed++;
});

console.log('=====================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

console.log('Explanation of Enhanced System:');
console.log('--------------------------------');
console.log('1. Uses both centipawn loss AND win probability for more accurate labeling');
console.log('2. Detects brilliant moves when saving lost positions');
console.log('3. Identifies missed wins/draws in mate situations');
console.log('4. Applies industry-standard thresholds:');
console.log('   - Best: <10cp loss');
console.log('   - Excellent: 10-25cp loss');
console.log('   - Good: 25-50cp loss');
console.log('   - Inaccuracy: 50-100cp loss');
console.log('   - Mistake: 100-300cp loss');
console.log('   - Blunder: ≥300cp loss');
