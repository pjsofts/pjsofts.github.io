/**
 * Posts the generated round-up to the Telegram channel.
 *
 *   node scripts/telegram-post.ts > post.txt
 *   node scripts/telegram-send.ts post.txt --dry
 *   node scripts/telegram-send.ts post.txt
 *
 * Messages are separated by a line containing only '====='. Sending is the one
 * irreversible step in the pipeline, so it defaults to nothing: --dry prints
 * what would go out, and without --send it stops after the preview.
 *
 * Credentials come from the environment, never from a file in the repo:
 *   TELEGRAM_BOT_TOKEN=...   from @BotFather
 *   TELEGRAM_CHAT_ID=@pjmentoring
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/telegram-send.ts <file> [--send]');
  process.exit(1);
}

const messages = readFileSync(file, 'utf8')
  .split(/\n=====\n/)
  .map((m) => m.trim())
  .filter(Boolean);

const tooLong = messages.filter((m) => m.length > 4096);
if (tooLong.length) {
  console.error(`refusing to send: ${tooLong.length} message(s) over 4096 chars`);
  process.exit(1);
}

console.log(`${messages.length} messages, ${messages.map((m) => m.length).join(' / ')} chars\n`);
messages.forEach((m, i) => {
  console.log(`--- ${i + 1} ---`);
  console.log(m.length > 300 ? `${m.slice(0, 300)}…` : m);
  console.log();
});

if (!process.argv.includes('--send')) {
  console.log('Preview only. Re-run with --send to post.');
  process.exit(0);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const chat = process.env.TELEGRAM_CHAT_ID;
if (!token || !chat) {
  console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.');
  process.exit(1);
}

for (const [i, text] of messages.entries()) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chat,
      text,
      // Plain text: the links are bare URLs and Telegram autolinks them.
      disable_web_page_preview: i > 0,
    }),
  });
  const body = (await res.json()) as { ok: boolean; description?: string };
  if (!body.ok) {
    console.error(`message ${i + 1} failed: ${body.description}`);
    console.error('Earlier messages were already posted — fix and resend the rest by hand.');
    process.exit(1);
  }
  console.log(`sent ${i + 1}/${messages.length}`);
  // Telegram throttles bursts to a channel; one per second stays well under it.
  await new Promise((r) => setTimeout(r, 1100));
}

console.log('done');
