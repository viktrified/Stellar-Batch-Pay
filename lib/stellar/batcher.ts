/**
 * Batching logic for chunking payments into multiple transactions
 */

import { PaymentInstruction, Asset } from './types';

export interface Batch {
  transactionIndex: number;
  payments: PaymentInstruction[];
}

/**
 * Split payment instructions into batches based on max operations per transaction
 */
export function createBatches(
  instructions: PaymentInstruction[],
  maxOperationsPerTransaction: number
): Batch[] {
  const batches: Batch[] = [];
  let currentBatch: PaymentInstruction[] = [];
  let transactionIndex = 0;

  for (const instruction of instructions) {
    currentBatch.push(instruction);

    // Each payment operation is 1 operation
    if (currentBatch.length >= maxOperationsPerTransaction) {
      batches.push({
        transactionIndex,
        payments: currentBatch,
      });
      currentBatch = [];
      transactionIndex++;
    }
  }

  // Add remaining payments as final batch
  if (currentBatch.length > 0) {
    batches.push({
      transactionIndex,
      payments: currentBatch,
    });
  }

  return batches;
}

/**
 * Parse asset string to code and issuer
 */
export function parseAsset(assetString: string): Asset {
  if (assetString === 'XLM') {
    return {
      code: 'XLM',
      issuer: null,
    };
  }

  const [code, issuer] = assetString.split(':');
  return {
    code,
    issuer,
  };
}

import { validatePaymentInstruction } from './validator';

/**
 * Get summary statistics for a batch of payments
 */
export function getBatchSummary(instructions: PaymentInstruction[]) {
  let totalAmount = 0;
  let validCount = 0;
  let invalidCount = 0;
  const assetCount = new Map<string, number>();

  for (const instruction of instructions) {
    totalAmount += parseFloat(instruction.amount);
    assetCount.set(instruction.asset, (assetCount.get(instruction.asset) || 0) + 1);

    const validation = validatePaymentInstruction(instruction);
    if (validation.valid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return {
    recipientCount: instructions.length,
    validCount,
    invalidCount,
    totalAmount: totalAmount.toString(),
    assetBreakdown: Object.fromEntries(assetCount),
  };
}
