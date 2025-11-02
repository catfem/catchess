// Test to verify symmetric move labeling for White and Black

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

console.log('Testing Symmetric Move Labeling');
console.log('================================\n');

const testCases = [
  {
    scenario: "White loses 30cp",
    desc: "White: Best move would give +2.0, played move gives +1.7 (30cp loss)",
    userMove: 'e2e3',
    engineMove: 'e2e4',
    currentEval: 1.7,  // After White's move
    prevEval: 2.0,     // After White's best move would have been
    color: 'w',
    expectedLoss: 30,
    expected: 'good'
  },
  {
    scenario: "Black loses 30cp (symmetric)",
    desc: "Black: Best move would give -2.0, played move gives -1.7 (30cp loss)",
    userMove: 'e7e6',
    engineMove: 'e7e5',
    currentEval: -1.7,  // After Black's move (from White's POV)
    prevEval: -2.0,     // After Black's best move would have been (from White's POV)
    color: 'b',
    expectedLoss: 30,
    expected: 'good'
  },
  {
    scenario: "White loses 70cp",
    desc: "White: Best move +1.5, played move +0.8 (70cp loss)",
    userMove: 'g1f3',
    engineMove: 'd2d4',
    currentEval: 0.8,
    prevEval: 1.5,
    color: 'w',
    expectedLoss: 70,
    expected: 'inaccuracy'
  },
  {
    scenario: "Black loses 70cp (symmetric)",
    desc: "Black: Best move -1.5, played move -0.8 (70cp loss)",
    userMove: 'd7d6',
    engineMove: 'd7d5',
    currentEval: -0.8,
    prevEval: -1.5,
    color: 'b',
    expectedLoss: 70,
    expected: 'inaccuracy'
  },
  {
    scenario: "White loses 150cp",
    desc: "White: Best move +0.5, played move -1.0 (150cp loss)",
    userMove: 'h2h4',
    engineMove: 'g1f3',
    currentEval: -1.0,
    prevEval: 0.5,
    color: 'w',
    expectedLoss: 150,
    expected: 'mistake'
  },
  {
    scenario: "Black loses 150cp (symmetric)",
    desc: "Black: Best move -0.5, played move +1.0 (150cp loss)",
    userMove: 'a7a5',
    engineMove: 'g8f6',
    currentEval: 1.0,
    prevEval: -0.5,
    color: 'b',
    expectedLoss: 150,
    expected: 'mistake'
  },
  {
    scenario: "White loses 400cp",
    desc: "White: Best move +0.3, played move -3.7 (400cp loss)",
    userMove: 'e1e2',
    engineMove: 'e1g1',
    currentEval: -3.7,
    prevEval: 0.3,
    color: 'w',
    expectedLoss: 400,
    expected: 'blunder'
  },
  {
    scenario: "Black loses 400cp (symmetric)",
    desc: "Black: Best move -0.3, played move +3.7 (400cp loss)",
    userMove: 'e8e7',
    engineMove: 'e8g8',
    currentEval: 3.7,
    prevEval: -0.3,
    color: 'b',
    expectedLoss: 400,
    expected: 'blunder'
  }
];

let passed = 0;
let failed = 0;
const whiteMoves = [];
const blackMoves = [];

testCases.forEach((test, index) => {
  const result = labelMove(
    test.userMove,
    test.engineMove,
    test.currentEval,
    test.prevEval,
    false,
    test.color,
    false
  );
  
  const isPass = result === test.expected;
  const isWhite = test.color === 'w';
  
  if (isWhite) {
    whiteMoves.push({ scenario: test.scenario, label: result, expected: test.expected, pass: isPass });
  } else {
    blackMoves.push({ scenario: test.scenario, label: result, expected: test.expected, pass: isPass });
  }
  
  console.log(`Test ${index + 1}: ${test.scenario}`);
  console.log(`  ${test.desc}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Status: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  console.log();
  
  if (isPass) passed++;
  else failed++;
});

console.log('================================');
console.log(`Results: ${passed} passed, ${failed} failed\n`);

// Check symmetry
console.log('Symmetry Check:');
console.log('---------------');
let symmetric = true;
for (let i = 0; i < whiteMoves.length; i++) {
  const white = whiteMoves[i];
  const black = blackMoves[i];
  const match = white.label === black.label && white.expected === black.expected;
  console.log(`${white.scenario.padEnd(25)} → ${white.label.padEnd(12)} | ${black.scenario.padEnd(25)} → ${black.label.padEnd(12)} ${match ? '✓' : '✗'}`);
  if (!match) symmetric = false;
}

console.log();
if (symmetric && passed === testCases.length) {
  console.log('✓ Perfect symmetry achieved!');
  console.log('  - White and Black moves with same CP loss get same labels');
  console.log('  - Evaluations correctly adjusted for perspective');
  console.log('  - Labels are consistent regardless of who is moving');
} else {
  console.log('✗ Asymmetry detected or tests failed');
}
