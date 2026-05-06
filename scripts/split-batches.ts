#!/usr/bin/env npx tsx
/**
 * Splits translations/source/it.json into N batches for parallel translation.
 * Run: npx tsx scripts/split-batches.ts <numBatches>
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const N = parseInt(process.argv[2] ?? '4', 10);
const SRC = join(__dirname, '..', 'translations', 'source', 'it.json');
const OUT_DIR = join(__dirname, '..', 'translations', '_batches');

const map: Record<string, string> = JSON.parse(readFileSync(SRC, 'utf-8'));
const entries = Object.entries(map);
const size = Math.ceil(entries.length / N);

mkdirSync(OUT_DIR, { recursive: true });
for (let i = 0; i < N; i++) {
  const slice = entries.slice(i * size, (i + 1) * size);
  const batch = Object.fromEntries(slice);
  writeFileSync(
    join(OUT_DIR, `it-batch-${i + 1}.json`),
    JSON.stringify(batch, null, 2) + '\n',
    'utf-8',
  );
  console.log(`Batch ${i + 1}: ${slice.length} entries`);
}
console.log(`Total: ${entries.length} entries split into ${N} batches in ${OUT_DIR}`);
