import { JOBS } from '../src/data/jobs.ts';
import type { Job } from '../src/data/jobs.ts';

export { JOBS };
export type { Job };

/**
 * LinkedIn activity IDs carry a millisecond epoch in their top 41 bits, so the
 * exact posting date comes out of the URL itself — no scraping a relative
 * "2 weeks ago" and hoping it rounds the way you expect.
 */
export function activityId(url: string): bigint | null {
  const m = url.match(/(?:activity[:-]|-)(\d{19})/);
  return m ? BigInt(m[1]) : null;
}

export function postedDate(id: bigint): string {
  const ms = Number(id >> 22n);
  return new Date(ms).toISOString().slice(0, 10);
}

/** Both LinkedIn URL shapes fetch fine; this is the short one worth storing. */
export function canonicalUrl(id: bigint): string {
  return `https://www.linkedin.com/feed/update/urn:li:activity:${id}`;
}

/** Activity IDs already on the board, for deduping a fresh batch of links. */
export function knownIds(): Set<string> {
  const s = new Set<string>();
  for (const j of JOBS) {
    const id = activityId(j.url);
    if (id) s.add(id.toString());
  }
  return s;
}

export const fa = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/**
 * Splits a list of blocks into messages under Telegram's 4096-character cap.
 * Blocks are never broken apart, so a role never straddles two messages.
 */
export function chunk(blocks: string[], limit = 3900): string[] {
  const out: string[] = [];
  let cur = '';
  for (const b of blocks) {
    if (cur && cur.length + b.length + 2 > limit) {
      out.push(cur);
      cur = b;
    } else {
      cur = cur ? `${cur}\n\n${b}` : b;
    }
  }
  if (cur) out.push(cur);
  return out;
}
