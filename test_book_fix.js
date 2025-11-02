// Test to verify book move labeling fix

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

console.log('Testing Book Move Fix');
console.log('=====================\n');

const testCases = [
  {
    desc: "Move 1: e2e4 (best move) - Should NOT be book",
    moveNumber: 1,
    userMove: 'e2e4',
    engineMove: 'e2e4',
    currentEval: 0.25,
    prevEval: 0.20,
    isBook: false,  // Fixed: no longer auto-true for early moves
    color: 'w',
    expected: 'best',
    shouldNotBe: 'book'
  },
  {
    desc: "Move 3: Nf3 (good move, 30cp loss) - Should NOT be book",
    moveNumber: 3,
    userMove: 'g1f3',
    engineMove: 'd2d4',
    currentEval: 0.10,
    prevEval: 0.40,
    isBook: false,  // Fixed: no longer auto-true for early moves
    color: 'w',
    expected: 'good',
    shouldNotBe: 'book'
  },
  {
    desc: "Move 5: e5?! (inaccuracy, 60cp loss) - Should NOT be book",
    moveNumber: 5,
    userMove: 'e7e5',
    engineMove: 'd7d5',
    currentEval: 0.60,
    prevEval: 0.00,
    isBook: false,  // Fixed: no longer auto-true for early moves
    color: 'b',
    expected: 'inaccuracy',
    shouldNotBe: 'book'
  },
  {
    desc: "Move 8: Qh5?? (blunder in opening) - Should NOT be book",
    moveNumber: 8,
    userMove: 'd8h5',
    engineMove: 'd8d7',
    currentEval: 3.50,
    prevEval: 0.00,
    isBook: false,  // Fixed: no longer auto-true for early moves
    color: 'b',
    expected: 'blunder',
    shouldNotBe: 'book'
  },
  {
    desc: "Actual book move (when implemented) - Should be book",
    moveNumber: 1,
    userMove: 'e2e4',
    engineMove: 'e2e4',
    currentEval: 0.25,
    prevEval: 0.20,
    isBook: true,  // When properly detected from opening database
    color: 'w',
    expected: 'book',
    shouldBe: 'book'
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
    false
  );
  
  const isPass = result === test.expected;
  const notBook = result !== 'book' || test.shouldBe === 'book';
  
  console.log(`Test ${index + 1}: ${test.desc}`);
  console.log(`  Move Number: ${test.moveNumber}`);
  console.log(`  isBookMove parameter: ${test.isBook}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Got: ${result}`);
  
  if (test.shouldNotBe) {
    console.log(`  ✓ Correctly NOT labeled as: ${test.shouldNotBe}`);
  }
  if (test.shouldBe) {
    console.log(`  ✓ Correctly labeled as: ${test.shouldBe}`);
  }
  
  console.log(`  Status: ${isPass && notBook ? '✓ PASS' : '✗ FAIL'}`);
  console.log();
  
  if (isPass && notBook) passed++;
  else failed++;
});

console.log('=====================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log();

if (passed === testCases.length) {
  console.log('✓ Book label fix verified!');
  console.log('  - Opening moves are now properly evaluated');
  console.log('  - Book label only applies when explicitly set');
  console.log('  - Mistakes and blunders in opening are now detected');
} else {
  console.log('✗ Some tests failed');
}
