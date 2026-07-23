# Job board pipeline

Three steps between "I found some LinkedIn posts" and "the channel has them."
Run with plain `node` — Node 24 strips the TypeScript itself, no build step.

## 1. Triage the links

```sh
node scripts/triage-links.ts links.txt
```

Decodes the posting date out of each activity ID, drops anything already on the
board, and flags posts made seconds apart — usually one role re-shared, not two
openings. Prints the worklist. Touches no network.

## 2. Transcribe

Still by hand, with Claude. For each NEW url: fetch it and record **only what
the post literally says** — title, company, location, arrangement, summary,
requirements, contact email, apply URL, and any instruction or caveat worth
reading first. Anything the post left out is `'Not specified'`, never a guess.
Then append to `src/data/jobs.ts` under the right date heading.

This step stays manual on purpose. The judgement calls — an unnamed employer
routing CVs to a personal Gmail, an ad demanding marital status and home
address, a "role" that is really a course ad — are the part worth keeping.

## 3. Publish

```sh
npm run build && git commit -am "Add N job postings" && git push
node scripts/telegram-post.ts > ../jobs-telegram-fa.txt
node scripts/telegram-send.ts ../jobs-telegram-fa.txt          # preview
node scripts/telegram-send.ts ../jobs-telegram-fa.txt --send   # post
```

The round-up is generated from `jobs.ts`, so it cannot drift out of sync with
the site. Output is plain text because Telegram Desktop does not render pasted
markdown — bare URLs on their own line are what actually autolink.

Sending needs, in the environment and never in the repo:

```sh
export TELEGRAM_BOT_TOKEN=...      # from @BotFather
export TELEGRAM_CHAT_ID=@pjmentoring
```

The bot must be an admin of the channel before it can post.
