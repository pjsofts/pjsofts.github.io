/**
 * Regenerates the Persian job round-up for the Telegram channel, straight from
 * jobs.ts, so the post can never drift out of sync with the board.
 *
 *   node scripts/telegram-post.ts > ../jobs-telegram-fa.txt
 *
 * By default it covers every open role. To announce just what was added this
 * week, narrow it — by date, or by an explicit list of slugs when a batch
 * includes older posts found late:
 *
 *   node scripts/telegram-post.ts --since 2026-07-20
 *   node scripts/telegram-post.ts --slugs new.txt
 *
 * Output is PLAIN TEXT on purpose. Telegram Desktop does not render pasted
 * markdown or HTML — it only autolinks bare URLs — so each role puts its link
 * on its own line rather than hiding it behind the title.
 */
import { readFileSync } from 'node:fs';
import { JOBS, fa, chunk } from './lib.ts';
import type { Job, JobCategory } from '../src/data/jobs.ts';

const BASE = 'https://pjsofts.github.io';

const CAT_FA: Record<JobCategory, string> = {
  Engineering: 'مهندسی نرم‌افزار',
  'AI & Data': 'هوش مصنوعی و داده',
  Design: 'طراحی',
  Product: 'محصول',
  Security: 'امنیت',
  'Media & Creative': 'رسانه و محتوا',
  'Business & Ops': 'کسب‌وکار و عملیات',
};

/**
 * Persian renderings of employer names. Opt-in only: anything absent stays in
 * Latin, because inventing a Persian spelling for a brand is a guess, and the
 * rest of the board is transcribed rather than guessed.
 */
const CO_FA: Record<string, string> = {
  Snapp: 'اسنپ',
  'Snapp Group': 'گروه اسنپ',
  Digikala: 'دیجی‌کالا',
  TAPSI: 'تپسی',
  'Melli Gold': 'ملی گلد',
  'Not named in the post': 'بدون نام کارفرما',
  'Not named in the post (a fertility clinic)': 'بدون نام کارفرما (کلینیک ناباروری)',
  'Undisclosed — currency exchange': 'بدون نام کارفرما (صرافی)',
  'Undisclosed — design studio': 'بدون نام کارفرما (استودیو طراحی)',
  'Undisclosed — e-commerce': 'بدون نام کارفرما (فروشگاه اینترنتی)',
};

const co = (j: Job) => CO_FA[j.company] ?? j.company;

/** Multi-role posts have titles too long for a chat line — collapse to a count. */
function label(title: string): string {
  if (title.length > 60 && /·| & |, /.test(title)) {
    const n = title.split(/ · | & |, /).length;
    return `${fa(n)} موقعیت`;
  }
  return title;
}

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};

const since = flag('since');
const slugFile = flag('slugs');
const slugs = slugFile
  ? new Set(
      readFileSync(slugFile, 'utf8')
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : undefined;

/** A subset post announces additions; the full post is the standing archive. */
const partial = Boolean(since || slugs);

const open = JOBS.filter(
  (j) =>
    j.status === 'open' &&
    (!since || j.posted >= since) &&
    (!slugs || slugs.has(j.slug)),
);

if (slugs) {
  const missing = [...slugs].filter((s) => !JOBS.some((j) => j.slug === s));
  if (missing.length) {
    console.error(`unknown slug(s): ${missing.join(', ')}`);
    process.exit(1);
  }
}

if (open.length === 0) {
  console.error('no roles matched the filter');
  process.exit(1);
}

/**
 * Employers re-advertise the same role days apart. Both posts stay on the site
 * — they are real, separate posts — but the round-up lists each role once.
 */
const seen = new Set<string>();
const roles = [...open]
  .sort((a, b) => b.posted.localeCompare(a.posted))
  .filter((j) => {
    const key = `${co(j)}|${j.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

const collapsed = open.length - roles.length;

const byCat = (Object.keys(CAT_FA) as JobCategory[])
  .map((c) => ({ cat: c, jobs: roles.filter((j) => j.category === c) }))
  .filter((g) => g.jobs.length > 0);

const messages: string[] = [];

const allOpen = JOBS.filter((j) => j.status === 'open').length;

const unnamed = roles.filter((j) => /^(Not named|Undisclosed)/.test(j.company)).length;
const noRoute = roles.filter((j) => !j.contact && !j.applyUrl).length;

messages.push(
  [
    partial
      ? `📌 ${fa(roles.length)} موقعیت شغلی تازه`
      : `📌 ${fa(roles.length)} موقعیت شغلی باز`,
    '',
    partial
      ? 'این‌ها موقعیت‌هایی است که تازه به بخش مشاغل سایت اضافه کردم.'
      : 'فهرست موقعیت‌هایی که دیدم و به نظرم ارزش معرفی داشتند.',
    'روی لینک هر موقعیت بزنید تا شرح کامل، شرایط و راه ارسال رزومه را ببینید.',
    '',
    'آگهی‌های لینکدین پاک می‌شوند، برای همین متن کامل هرکدام را در سایت نگه می‌دارم؛',
    'حتی وقتی لینک اصلی از بین برود، آگهی همچنان خواندنی است.',
    '',
    ...byCat.map((g) => `${CAT_FA[g.cat]} — ${fa(g.jobs.length)}`),
    '',
    partial
      ? `در مجموع ${fa(allOpen)} موقعیت باز روی سایت هست:`
      : '',
    `${BASE}/jobs`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n'),
);

for (const g of byCat) {
  const blocks = g.jobs.map(
    (j) => `• ${label(j.title)} — ${co(j)}\n${BASE}/jobs/${j.slug}/`,
  );
  const parts = chunk(blocks);
  parts.forEach((p, i) => {
    const head =
      parts.length > 1
        ? `${CAT_FA[g.cat]} (${fa(i + 1)}/${fa(parts.length)})`
        : CAT_FA[g.cat];
    messages.push(`${head}\n\n${p}`);
  });
}

messages.push(
  [
    'چند نکته پیش از ارسال رزومه:',
    '',
    /*
     * Counted from the data rather than written by hand, so the caveats stay
     * true for whatever batch is being posted.
     */
    unnamed > 0
      ? `در ${fa(unnamed)} آگهی نام کارفرما نیامده. پیش از فرستادن رزومه بپرسید کارفرما کیست.`
      : '',
    '',
    noRoute > 0
      ? `در ${fa(noRoute)} آگهی هیچ ایمیل، فرم یا لینکی برای ارسال رزومه نیامده. متن آگهی را نگه داشته‌ام، اما راه ارسال را خودشان ننوشته‌اند.`
      : '',
    '',
    collapsed > 0
      ? `${fa(collapsed)} آگهی با فاصله چند روز دوباره منتشر شده بود؛ در این فهرست یک‌بار آمده است.`
      : '',
    '',
    'من کارفرما یا استخدام‌کننده نیستم و در فرایند استخدام هیچ‌کدام از این شرکت‌ها نقشی ندارم. مستقیم از طریق خود آگهی اقدام کنید.',
    '',
    `${BASE}/jobs`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n'),
);

const over = messages.filter((m) => m.length > 4096);
if (over.length) {
  console.error(`ERROR: ${over.length} message(s) exceed Telegram's 4096-char cap.`);
  process.exit(1);
}

console.error(
  `${messages.length} messages · longest ${Math.max(...messages.map((m) => m.length))} chars · ` +
    `${roles.length} roles (${collapsed} re-posts collapsed)`,
);

console.log(messages.join('\n\n=====\n\n'));
