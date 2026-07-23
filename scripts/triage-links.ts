/**
 * Reads LinkedIn post links (one per line, on stdin or in a file) and reports
 * which are new, when each was posted, and which are already on the board.
 *
 *   node scripts/triage-links.ts links.txt
 *   pbpaste | node scripts/triage-links.ts
 *
 * Nothing here touches the network. It only decodes the activity ID, so the
 * output is the worklist: fetch and transcribe exactly the URLs marked NEW.
 */
import { readFileSync } from 'node:fs';
import { JOBS, activityId, postedDate, canonicalUrl, knownIds } from './lib.ts';

const src = process.argv[2]
  ? readFileSync(process.argv[2], 'utf8')
  : readFileSync(0, 'utf8');

const urls = src
  .split(/\s+/)
  .map((s) => s.trim())
  .filter((s) => s.includes('linkedin.com'));

const known = knownIds();
const seen = new Set<string>();

type Row = { id: bigint; date: string; url: string };
const fresh: Row[] = [];
const onBoard: Row[] = [];
const dupes: string[] = [];
const unparsed: string[] = [];

for (const url of urls) {
  const id = activityId(url);
  if (!id) {
    unparsed.push(url);
    continue;
  }
  const key = id.toString();
  if (seen.has(key)) {
    dupes.push(url);
    continue;
  }
  seen.add(key);
  const row = { id, date: postedDate(id), url: canonicalUrl(id) };
  (known.has(key) ? onBoard : fresh).push(row);
}

fresh.sort((a, b) => b.date.localeCompare(a.date));

console.log(`${urls.length} links in · ${fresh.length} new · ${onBoard.length} already listed`);
console.log(`board currently holds ${JOBS.length} entries\n`);

if (fresh.length) {
  console.log('NEW — fetch and transcribe these:');
  for (const r of fresh) console.log(`  ${r.date}  ${r.url}`);
}

if (onBoard.length) {
  console.log('\nALREADY LISTED — skip:');
  for (const r of onBoard) console.log(`  ${r.date}  ${r.url}`);
}

if (dupes.length) {
  console.log(`\nREPEATED IN INPUT (${dupes.length}) — counted once.`);
}

if (unparsed.length) {
  console.log('\nNO ACTIVITY ID — check these by hand:');
  for (const u of unparsed) console.log(`  ${u}`);
}

/*
 * Near-duplicate warning. Two posts seconds apart from the same employer are
 * usually one role re-shared, not two openings — worth a look before adding
 * both. Compares only within the new batch, and only flags, never drops.
 */
const all = [...fresh].sort((a, b) => (a.id < b.id ? -1 : 1));
const near: string[] = [];
for (let i = 1; i < all.length; i++) {
  const gap = Number(all[i].id >> 22n) - Number(all[i - 1].id >> 22n);
  if (gap < 60_000) near.push(`  ${all[i - 1].url}\n  ${all[i].url}  (${gap}ms apart)`);
}
if (near.length) {
  console.log('\nPOSTED SECONDS APART — check whether these are the same role:');
  for (const n of near) console.log(n);
}
