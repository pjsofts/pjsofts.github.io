---
title: "Chat Completions در برابر Responses API: راهنمای عملی مهاجرت"
description: "تغییر مدل ذهنی از پیام‌ها به آیتم‌ها، نقشهٔ مهاجرت فیلد به فیلد، تول‌کالینگ با call_id، وضعیت مکالمه، و اینکه چطور همان کد از طریق SDK اوپن‌ای‌آی، یک گیت‌وی و LangChain اجرا می‌شود."
pubDate: 2026-07-19
tags: ["OpenAI", "Responses API", "Agents", "API Design", "Migration"]
readingTime: 12
featured: true
---

اگر روی SDK شرکت OpenAI ایجنت می‌سازید، دو API برای انتخاب دارید و تفاوت‌شان ظاهری نیست. **Chat Completions** با *پیام‌ها* فکر می‌کند. **Responses** با *آیتم‌ها*. تقریباً تمام تفاوت‌های دیگر — تول‌کالینگ، وضعیت، استریم، خروجی ساخت‌یافته — از همین یک تغییر سرچشمه می‌گیرند.

این هم نسخهٔ عملی ماجرا: چه چیزی تغییر می‌کند، چه چیزی می‌شکند، و در برابرش چه باید کرد.

## مدل ذهنی

Chat Completions یک فهرست تخت از آبجکت‌های `role`/`content` به شما می‌دهد که در هر نوبت باید کامل دوباره ارسال کنید. یک نوع آبجکت همهٔ دغدغه‌ها را حمل می‌کند — متن، تول‌کال‌ها، نتایج ابزار — که فقط با role از هم تفکیک می‌شوند.

Responses به شما **آیتم‌های تایپ‌دار** می‌دهد: `message`، `reasoning`، `function_call`، `function_call_output`. هر کدام واحد مستقلی از کانتکست مدل است، و سرور می‌تواند در صورت تمایل آن‌ها را برایتان به خاطر بسپارد.

> آیتم‌ها از هم متمایزند و واحد پایهٔ کانتکست مدل را بهتر بازنمایی می‌کنند — برخلاف پیام Chat Completions که در آن دغدغه‌های زیادی در یک آبجکت به هم چسبانده شده‌اند.

این حرف تا وقتی به یک مدل استدلالی برنخورده‌اید آکادمیک به نظر می‌رسد؛ آنجاست که تفاوت کاملاً ملموس می‌شود: استدلال (reasoning) خودش یک نوع آیتم مستقل است، و حذف آن بین نوبت‌ها به‌طور قابل‌اندازه‌گیری نتایج را افت می‌دهد.

## سلام دنیا، به هر دو روش

سه تغییر: پیام سیستم به یک فیلد سطح‌بالای `instructions` تبدیل می‌شود، `messages` به `input` تبدیل می‌شود (رشتهٔ خالی مجاز است)، و به جای کندوکاو در `choices[0].message.content` مقدار `output_text` را می‌خوانید.

```python
# Chat Completions — the old shape
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user",   "content": "Hello!"},
    ],
)
print(resp.choices[0].message.content)
```

```python
# Responses
resp = client.responses.create(
    model="gpt-4o-mini",
    instructions="You are helpful.",   # was the system message
    input="Hello!",                    # a string OR a list of items
)
print(resp.output_text)                # helper: joins all text output
```

در TypeScript تقریباً همان‌طور خوانده می‌شود:

```ts
const resp = await client.responses.create({
  model: "gpt-4o-mini",
  instructions: "You are helpful.",
  input: "Hello!",
});
console.log(resp.output_text);
```

## نقشهٔ مهاجرت فیلد به فیلد

| Chat Completions | Responses | نکته |
|---|---|---|
| `messages` (آرایه) | `input` (رشته یا آرایهٔ آیتم) | یک رشتهٔ ساده میان‌بری است برای یک پیام کاربر |
| پیام سیستم داخل `messages` | `instructions` (سطح بالا) | از تاریخچهٔ نوبت‌ها جدا شده است |
| `tools[].function.name` | `tools[].name` | اسکیما تخت شده — آبجکت تودرتوی `function` وجود ندارد |
| توابع به‌طور پیش‌فرض غیر strict | حذف `strict` → تلاش برای strict | اگر اسکیما را نتوان strict کرد، به حالت best-effort برمی‌گردد |
| `response_format` | `text.format` | پیکربندی خروجی ساخت‌یافته زیر `text` منتقل شده است |
| `choices[0].message.content` | `output_text` / پیمایش `output` | خروجی فهرستی از آیتم‌های تایپ‌دار است، نه یک پیام |
| ارسال دوبارهٔ کل تاریخچه | `previous_response_id` + `store` | وضعیت اختیاری سمت سرور |
| چانک‌های `delta` | ایونت‌های تایپ‌دار `response.*` | روی `event.type` شاخه بزنید |

## تول‌کالینگ: اسکیماهای تخت، نتایج با کلید call_id

دو چیز تغییر می‌کند. اسکیمای ابزار حالا **internally tagged** است — یعنی `name` و `parameters` در سطح بالا قرار می‌گیرند:

```json
// Chat Completions — externally tagged
{ "type": "function", "function": { "name": "get_weather", "parameters": { } } }

// Responses — internally tagged
{ "type": "function", "name": "get_weather", "parameters": { }, "strict": false }
```

و یک تول‌کال و نتیجه‌اش حالا **دو آیتم جداگانه‌اند** که با `call_id` به هم متصل می‌شوند. مدل یک `function_call` صادر می‌کند؛ شما با یک `function_call_output` که همان `call_id` را حمل می‌کند پاسخ می‌دهید. در تول‌کال‌های موازی، همین کلید اتصال است که همه‌چیز را بدون ابهام نگه می‌دارد.

## حلقهٔ ایجنت

حرکت کلیدی، **افزودن خروجی خودِ مدل به انتهای `input`** است — همان فهرست، *حافظهٔ* ایجنت است.

```python
context = [{"role": "user", "content": "Weather in Paris?"}]
resp = client.responses.create(model=MODEL, input=context, tools=tools)

context += resp.output                      # the memory
for item in resp.output:
    if item.type != "function_call":
        continue
    args = json.loads(item.arguments)
    result = get_weather(**args)
    context.append({
        "type": "function_call_output",
        "call_id": item.call_id,            # correlate by call_id
        "output": json.dumps(result),
    })

final = client.responses.create(model=MODEL, input=context, tools=tools)
print(final.output_text)
```

### یک کست TypeScript که به آن نیاز خواهید داشت

در حالت `strict`، آیتم‌های خروجی *ابرمجموعه‌ای* از آیتم‌های ورودی‌اند (واریانت‌های اضافیِ ابزارهای میزبانی‌شده و MCP)، بنابراین `ResponseOutputItem[]` قابل انتساب به `ResponseInputItem[]` نیست:

```ts
context.push(...(resp.output as OpenAI.Responses.ResponseInputItem[]));
```

این کست برای یک ایجنت سادهٔ مبتنی بر فراخوانی تابع امن است — آن واریانت‌ها هرگز در ران‌تایم ظاهر نمی‌شوند. بقیهٔ کد بدون مشکل تایپ‌چک می‌شود.

## وضعیت مکالمه: سه گزینه

این قابلیتِ سرخط ماجراست. Chat Completions بی‌وضعیت (stateless) است؛ در هر فراخوانی کل رونوشت مکالمه را دوباره پخش می‌کنید. Responses به شما حق انتخاب می‌دهد.

**1. زنجیره‌سازی سمت سرور.** `store: true` را تنظیم کنید، سپس `previous_response_id` را پاس بدهید و فقط نوبت جدید را بفرستید:

```python
r1 = client.responses.create(model=MODEL, input="What is France's capital?", store=True)
r2 = client.responses.create(model=MODEL, input="And its population?",
                             previous_response_id=r1.id, store=True)
```

دو دام که گریبان خیلی‌ها را می‌گیرد: بابت توکن‌های ورودیِ قبلی در زنجیره **همچنان هزینه می‌پردازید**، و `instructions` به نوبت بعد **منتقل نمی‌شود** — در هر فراخوانی دوباره بفرستیدش.

**2. بازپخش دستی.** فهرست آیتم‌ها را خودتان نگه دارید. کاملاً قابل‌حمل، سرور هیچ چیزی نگه نمی‌دارد — حلقهٔ ایجنت بالا دقیقاً همین کار را می‌کند.

**3. Conversations API.** یک آبجکت ماندگار سمت سرور برای اپلیکیشن‌های رشته‌محور (thread-like) که به تاریخچهٔ پایدار نیاز دارند.

برای پیکربندی‌های بدون نگهداری داده (zero-data-retention)، حالت `store: false` محتوای استدلالِ **رمزنگاری‌شده** برمی‌گرداند که در فراخوانی بعدی آن را پس می‌دهید. در حافظه رمزگشایی می‌شود، استفاده می‌شود و دور ریخته می‌شود — پیوستگی استدلال را حفظ می‌کنید بی‌آنکه سرور چیزی را ماندگار کند.

## خواندن پاسخ

فرض نکنید فقط یک پیام است. یک پاسخ واحد می‌تواند یک آیتم `reasoning`، چند آیتم `function_call` و یک `message` نهایی را با هم حمل کند:

```json
{
  "output": [
    { "type": "reasoning", "summary": [ ] },
    { "type": "function_call", "name": "...", "call_id": "...", "arguments": "..." },
    { "type": "message", "content": [ { "type": "output_text", "text": "..." } ] }
  ],
  "output_text": "…"
}
```

استریم هم از همین منطق پیروی می‌کند — ایونت‌های تایپ‌دار server-sent (`response.created`، `response.output_text.delta`، `response.function_call_arguments.delta`، `response.completed`) به جای یک شکل واحد `delta`.

## ابزارهای میزبانی‌شده

چون ابزارها بومی‌اند، چند تایشان کاملاً سمت OpenAI اجرا می‌شوند. شما فقط اعلام‌شان می‌کنید و پاسخ را می‌خوانید — نه تابع محلی، نه لوله‌کشی نتیجه:

```python
resp = client.responses.create(
    model=MODEL,
    input="What shipped in AI this week?",
    tools=[{"type": "web_search"}],   # also: file_search, code_interpreter
)
```

## این شکل سفر می‌کند

این همان بخشی است که از چشم خیلی‌ها پنهان می‌ماند: **شکل درخواستِ** Responses به یک استاندارد de-facto تبدیل شده است، مستقل از اینکه چه کسی مدل را اجرا می‌کند.

**گیت‌وی‌ها.** همان SDK اوپن‌ای‌آی را به آدرس پایهٔ یک گیت‌وی وصل کنید و مدل را با پیشوند `provider/model` انتخاب کنید — همان فراخوانی به Anthropic یا Google مسیریابی می‌شود، و خروجی همچنان به شکل `output_text` و آیتم‌های `output` می‌رسد:

```ts
const client = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1",
});
const resp = await client.responses.create({
  model: "anthropic/claude-sonnet-4.6",
  input: "What is the capital of France?",
});
```

**فریمورک‌ها.** کلاس `ChatOpenAI` در LangChain به‌طور پیش‌فرض از Chat Completions استفاده می‌کند اما به محض اینکه از قابلیتی مخصوص Responses استفاده کنید، خودکار به Responses سوییچ می‌کند — یا خودتان اجبارش می‌کنید:

```python
llm = ChatOpenAI(model="gpt-4o-mini", use_responses_api=True)
llm_tools = llm.bind_tools([{"type": "web_search"}])
```

**سایر ارائه‌دهندگان.** API خود xAI اندپوینت‌های سازگار با OpenAI یعنی `/v1/chat/completions` و `/v1/responses` را روی `api.x.ai` پیاده‌سازی کرده است. آن‌ها *سرویس* OpenAI را نپذیرفتند — *اینترفیس* آن را پذیرفتند.

## پنج خطایی که مردم واقعاً به آن برمی‌خورند

1. خواندن `choices[0].message.content` روی یک آبجکت Responses
2. برخورد با هر مدخل خروجی به‌عنوان پیام (و انداختن آیتم‌های `reasoning` و ابزار)
3. ارسال نتیجهٔ ابزار بدون `call_id` متناظر
4. پاس دادن `response_format` به جای `text.format`
5. فرض اینکه `previous_response_id` توکن‌های قبلی را رایگان می‌کند — نمی‌کند

## کدام‌یک، کِی

**برای هر چیز ایجنتیک سراغ Responses بروید**: حلقه‌های ابزار، مدل‌های استدلالی، ابزارهای میزبانی‌شدهٔ وب/فایل/کد، حافظهٔ سمت سرور، یا مسیریابی چندارائه‌دهنده. پروژه‌های جدید از همین‌جا شروع می‌شوند.

**Chat Completions همچنان خوب است** برای یک تکمیل تک‌مرحله‌ای بدون ابزار و بدون وضعیت، یا یکپارچه‌سازی‌ای که فعلاً نمی‌خواهید دست بزنید. فردا از بین نمی‌رود — اما قابلیت‌های ایجنتی هم به آن اضافه نمی‌شود.

نسخهٔ یک‌خطی ماجرا: Chat Completions در هر نوبت می‌پرسد *«پیام‌ها چیست؟»*. Responses می‌پرسد *«از نوبت قبل چه چیزی تغییر کرده؟»* — و اجازه می‌دهد سرور بقیه را نگه دارد. ایجنت‌ها را بر پایهٔ پرسش دوم بسازید.

---

*این همان چیزهایی است که در [هفتهٔ اول منتورشیپ مهندسی AI](/curriculum/week-1-your-first-agent) عمیق به آن می‌پردازیم؛ جایی که کل حلقهٔ ایجنت را با دست خودتان می‌سازید.*
