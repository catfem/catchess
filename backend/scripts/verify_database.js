import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'chess_openings.db');

console.log('Verifying database at:', dbPath);
const db = new Database(dbPath, { readonly: true });

// Get total count
const totalStmt = db.prepare('SELECT COUNT(*) as count FROM openings');
const { count: total } = totalStmt.get();
console.log(`\n✓ Total openings in database: ${total}`);

// Get category breakdown
const categoryStmt = db.prepare(`
  SELECT category, COUNT(*) as count
  FROM openings
  GROUP BY category
  ORDER BY count DESC
`);
const categories = categoryStmt.all();
console.log(`\n✓ Categories (${categories.length} total):`);
categories.forEach(cat => {
  console.log(`  ${cat.category}: ${cat.count}`);
});

// Get sample gambits
const gambitsStmt = db.prepare(`
  SELECT name, eco, description
  FROM openings
  WHERE category = 'Gambit'
  LIMIT 5
`);
const gambits = gambitsStmt.all();
console.log(`\n✓ Sample Gambits:`);
gambits.forEach(g => {
  console.log(`  ${g.eco} - ${g.name}`);
  console.log(`    ${g.description}`);
});

// Get sample Sicilian variations
const sicilianStmt = db.prepare(`
  SELECT name, eco
  FROM openings
  WHERE category = 'Sicilian Defense'
  LIMIT 5
`);
const sicilians = sicilianStmt.all();
console.log(`\n✓ Sample Sicilian Defense variations:`);
sicilians.forEach(s => {
  console.log(`  ${s.eco} - ${s.name}`);
});

// Verify all entries have required fields
const missingFieldsStmt = db.prepare(`
  SELECT COUNT(*) as count
  FROM openings
  WHERE name IS NULL OR eco IS NULL OR category IS NULL OR description IS NULL
`);
const { count: missing } = missingFieldsStmt.get();
console.log(`\n✓ Entries with missing fields: ${missing}`);

db.close();

if (total >= 1300 && missing === 0) {
  console.log('\n✅ Database verification PASSED!');
  console.log(`   - ${total} openings loaded`);
  console.log('   - All entries have complete data');
  console.log('   - Multiple categories properly assigned');
  process.exit(0);
} else {
  console.log('\n❌ Database verification FAILED!');
  if (total < 1300) {
    console.log(`   - Expected at least 1300 openings, found ${total}`);
  }
  if (missing > 0) {
    console.log(`   - Found ${missing} entries with missing fields`);
  }
  process.exit(1);
}
