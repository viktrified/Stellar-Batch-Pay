import { getBatchSummary } from './lib/stellar/batcher.js';

const mockInstructions = [
  { address: 'GAABBB...', amount: '100.50', asset: 'XLM' }, // Valid
  { address: 'INVALID', amount: '50.00', asset: 'XLM' },   // Invalid address
  { address: 'GCCCC...', amount: '-10.00', asset: 'XLM' },  // Invalid amount
  { address: 'GDDDD...', amount: '200.00', asset: 'USDC:GFFFF...' } // Valid issued asset
];

console.log('--- Testing getBatchSummary ---');
const summary = getBatchSummary(mockInstructions);
console.log('Summary:', JSON.stringify(summary, null, 2));

if (summary.recipientCount === 4 && summary.validCount === 2 && summary.invalidCount === 2) {
  console.log('✅ Logic Test Passed!');
} else {
  console.log('❌ Logic Test Failed!');
  console.log(`Expected: 4 rec, 2 val, 2 inv. Got: ${summary.recipientCount} rec, ${summary.validCount} val, ${summary.invalidCount} inv`);
}
