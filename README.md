# VisaAI — Smart Visa Application Portal

A demo travel/immigration platform: applicant picks a country and a visa
type (Study / Married / Visit / Work), uploads documents, is given an
interview slot, sits a webcam "AI interview" with fairness rules
(no outside AI help, no leaving the tab), gets a pass/fail decision, and —
if approved — books a flight.

This is **Phase 1 + a working interview shell**, built as a portfolio
project. It runs immediately with no backend (uses your browser's
`localStorage`), and has clear extension points for a real database and a
real AI scoring model.

---

## 1. What's real vs. what's a placeholder

| Feature | Status |
|---|---|
| Country / visa type selection, multi-step apply wizard | ✅ Fully working |
| Document upload | ✅ Real upload to **Cloudinary** (image or video) once you add your own free Cloudinary credentials |
| Interview slot assignment | ✅ Working (assigns "tomorrow, next available hour" for the demo) |
| Camera/mic preview during interview | ✅ Real `getUserMedia` webcam preview |
| Interview recording | ✅ Real — the whole interview is recorded with `MediaRecorder` and uploaded to **Cloudinary** (`visaai/interviews` folder) once you add your credentials. A link to watch it back shows up on the dashboard |
| Voice interview (real conversation) | ✅ Real — the AI asks each question out loud and transcribes your spoken answer live, using the browser's built-in Web Speech API (no API key, free). Chromium browsers only (Chrome/Edge desktop, Chrome on Android) — see section 7a |
| Typed interview | ✅ Real — the original text-based flow, still available as an alternative to voice on every browser |
| Cheating detection — tab/window switch | ✅ Real — using the Page Visibility API. Leaving the tab twice auto-rejects the application. Applies in both voice and typed mode |
| Cheating detection — pasted answers | ✅ Real — pasting into the typed answer box, or into the voice-mode transcript review box, is blocked and instantly ends the interview as a rejection (this is what stops someone pasting in an AI-generated answer) |
| Interview questions | ✅ Real question bank per visa type, answered by voice or by typing |
| AI scoring of answers | ✅ **Real** — a server route (`/api/score-interview`) sends the transcript to Claude once you add `ANTHROPIC_API_KEY`. Falls back to a local keyword heuristic automatically if that key isn't set or the call fails |
| Application storage | ✅ **Supabase-backed** once you add your project's URL/key (see `supabase/schema.sql`) — falls back to browser `localStorage` automatically if you don't |
| Accounts / login | ✅ **Real Supabase Auth** (email + password). Signing in ties the application to your account, so you can open the same case from another device. Row Level Security scopes every row to its owner. Without Supabase, the app runs in single-browser demo mode and the sign-in UI says so |
| Seat selection | ✅ Interactive seat map with zones (extra legroom / front / standard), taken seats, and per-seat pricing that flows into the payment |
| Baggage add-ons | ✅ Three allowances, priced per cabin, added as separate Stripe line items |
| Flight search | ✅ **Real** — `/api/flights/search` queries the **Duffel** airline API once you add `DUFFEL_API_KEY`. Without the key it returns deterministic demo fares so the flow is always demonstrable |
| Payment | ✅ **Real** — `/api/checkout` creates a **Stripe Checkout** session and the payment is verified server-side before a ticket is issued. Without `STRIPE_SECRET_KEY` the UI simulates the payment |
| Ticket issuing / boarding pass | ✅ Real order creation through Duffel (`/api/flights/book`) when a live Duffel offer was booked; otherwise a demo confirmation. Boarding pass is printable |

Being upfront about this so you know exactly what to say if this comes up
in an interview: **every integration here is real code against the real
API — Cloudinary, Supabase, Claude, Stripe and Duffel — and each one
degrades to a working local fallback when its key is absent, so the demo
never breaks in front of an interviewer.** The only parts that are
simulated by design are the interview slot scheduling and (in fallback
mode) the airline order.

---

> **Naya yahan se shuru kar rahe ho?** Poori step-by-step setup (kya
> install karna hai, kaunsi key kahan se milegi, kaunsi SQL run karni hai,
> troubleshooting) alag file mein hai: **[SETUP.md](./SETUP.md)**.
> `.env.local` bhi already bani hui hai — sirf values paste karni hain.

---

## 2. Install & run

You need **Node.js 20+** installed.

```bash
# 1. unzip the project, then inside the folder:
npm install

# 2. copy the env file and fill it in (see step 3 below)
cp .env.example .env.local

# 3. run it
npm run dev
```

Open **http://localhost:3000**.

Without any `.env.local` values, everything works *except* document
upload (you'll see an error telling you Cloudinary isn't configured yet).

---

## 3. Setting up Cloudinary (for document upload)

1. Create a free account at https://cloudinary.com
2. On your Cloudinary Dashboard, copy the **Cloud name** shown at the top.
3. Go to **Settings → Upload → Upload presets → Add upload preset**.
   - Set **Signing Mode** to **Unsigned** (required — this lets the
     browser upload directly without exposing your API secret).
   - Save it and copy its **preset name**.
4. Put both values into `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

5. Restart `npm run dev`. Document uploads on `/apply/documents` will now
   land in your Cloudinary Media Library, inside a `visaai/documents`
   folder — and finishing an interview will upload the recorded clip into
   a `visaai/interviews` folder, with a link to it on `/dashboard`.

---

## 4. Adding real destination photos (HD images)

Country cards use hand-drawn line-art landmark icons by default — on
purpose, so there's never a broken/placeholder image. To show a real HD
photo instead, open `src/lib/countries.ts` and add a `heroImageUrl` to any
country:

```ts
{
  code: "CA",
  name: "Canada",
  // ...
  heroImageUrl: "https://res.cloudinary.com/your_cloud_name/image/upload/toronto.jpg",
}
```

It'll immediately render full-bleed on the apply page and the ticket page
via `next/image` (see `src/components/DestinationPhoto.tsx`), with the
line-art falling back automatically for any country you leave unset.
`next.config.ts` already whitelists Cloudinary, Unsplash, and Wikimedia
Commons as image hosts — add your own host there if you use something
else.

---

## 5. Project structure

```
src/
  app/
    page.tsx                  Landing page
    apply/page.tsx            Step 1 — country + visa type
    apply/documents/page.tsx  Step 2 — document upload
    apply/review/page.tsx     Step 3 — review + submit (creates the application)
    dashboard/page.tsx        Status timeline + "Begin interview" / "Book flight"
    dashboard/ticket/page.tsx Flight search -> seat & baggage -> Stripe -> boarding pass
    login/page.tsx            Sign in / create account (Supabase Auth)
    api/flights/search/route.ts   Server route — Duffel flight search (demo fallback)
    api/flights/book/route.ts     Server route — Duffel order creation (demo fallback)
    api/checkout/route.ts         Server route — Stripe Checkout session create + verify
    interview/page.tsx        Fairness gate -> camera -> questions -> scoring
    api/score-interview/route.ts  Server route — sends transcript to Claude, scores it
  components/                 UI building blocks (Navbar, Hero, cards, uploader...)
    InterviewRecorder.tsx      Camera view that also records + hands off the clip to Cloudinary
    DestinationPhoto.tsx        HD country photo banner (falls back to line-art if unset)
    FlightOfferCard.tsx         One searchable fare (airline, times, stops, price)
    SeatAndBaggage.tsx          Interactive seat map + baggage add-on picker
    BoardingPass.tsx            Printable boarding pass shown after payment
  lib/
    countries.ts               Country data + arrival airports + departure airport list
    flights.ts                  Money/duration formatting, demo fare generator, PNR/seat maker
    seatmap.ts                  Deterministic seat map + baggage options per cabin
    auth.ts                     Supabase Auth helpers + useAuth() hook
    visa-types.ts               Visa type data + required documents
    interview.ts                Question bank + scoring heuristic
    store.ts                    Data layer — Supabase if configured, else localStorage
    supabase.ts                  Lazy Supabase client (returns null if unconfigured)
    cloudinary.ts                Unsigned upload helper (images + video)
    use-focus-guard.ts           Tab-switch / cheating detection hook
  types/index.ts                Shared TypeScript types
supabase/schema.sql            Run this once in your Supabase SQL editor
```

---

## 6. Setting up Supabase (optional — persistent storage)

Without this, applications live in the browser's `localStorage` (one
device = one application), which is fine for a demo. To persist them properly:

1. Create a free project at https://supabase.com
2. In the SQL editor, run everything in `supabase/schema.sql` — it creates
   the `applications` table with permissive demo policies (tighten these
   before using this for real users).
3. From **Project Settings → API**, copy the **Project URL** and the
   **anon public** key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Restart `npm run dev`. `src/lib/store.ts` detects the env vars
   automatically and switches every read/write over to Supabase — no
   other code changes needed. Leave the vars empty and it keeps using
   `localStorage`, so the app never breaks either way.

---

## 7a. How the voice interview works (and its limits)

The applicant picks **Voice** or **Typed** right before the interview starts
(`/interview`, the gate screen). Voice mode uses the browser's own
**Web Speech API** — `SpeechSynthesis` to have the AI ask each question out
loud, and `SpeechRecognition` to transcribe the spoken answer live:

- No API key, no server cost, no extra npm package — it's built into the
  browser.
- **Chromium-only today**: Chrome and Edge on desktop, and Chrome on
  Android. Safari/Firefox don't implement `SpeechRecognition`, so the
  "Voice interview" button is automatically disabled there and the
  applicant is guided to Typed instead — the interview never blocks on an
  unsupported browser.
- After speaking, the applicant sees the transcript and can fix any
  mishearing before confirming — same as double-checking a message before
  sending it.
- This is intentionally **not** OpenAI's Realtime API or a
  Whisper/WebRTC pipeline. Those need a paid key, a signalling/session
  server, and per-minute audio billing — a lot of moving parts for a demo
  repo. Browser-native speech gets you a genuinely real, live spoken
  conversation with zero setup; if you later want studio-quality
  transcription or a phone-call-style interview, that's the natural
  upgrade path (swap `src/lib/use-speech.ts` for calls to your chosen
  provider).

**Cheating detection is shared across both modes** (`src/lib/use-focus-guard.ts`):
tab/window switching is tracked by the Page Visibility API regardless of
mode, and pasting text into an answer — the typed box, or the voice
transcript review box — is caught by an `onPaste` handler and ends the
session immediately. Both are client-side signals; a production system
would corroborate them server-side (e.g. session heartbeats), noted here
so it's clear what "detection" means in a portfolio build like this one.

## 7. Setting up real AI scoring

Without this, `/api/score-interview` returns an error and
`scoreInterview()` in `src/lib/interview.ts` silently falls back to a
local keyword-matching heuristic — the demo still runs end to end either
way, just without a real judgment call.

1. Get an API key from https://console.anthropic.com
2. Add it to `.env.local` — **no** `NEXT_PUBLIC_` prefix, since this key
   must never reach the browser:

```
ANTHROPIC_API_KEY=your_key_here
```

3. Restart `npm run dev`. Finishing an interview now sends the full
   transcript, the destination, visa type, and which required documents
   are missing to Claude (`src/app/api/score-interview/route.ts`), and
   uses its score, approve/reject call, and one-line reasoning — which
   also shows up on the dashboard next to the decision.

---

## 8. Upgrade paths for the interview

**Real-time video interview** — if you want an actual spoken conversation
instead of typed answers, look at OpenAI's Realtime API or a WebRTC +
Whisper pipeline, and feed the transcript into the existing
`/api/score-interview` route. This is the most technically demanding
piece — treat it as its own phase.

---

## 8b. Setting up Stripe + Duffel (real payment & ticketing)

Both are optional. The booking page works with neither of them — it just
labels itself as a demo confirmation. Add them when you want the real thing.

### Stripe (card payment)

1. Create a free account at <https://dashboard.stripe.com/register>.
2. Make sure the dashboard is in **Test mode** (toggle, top right).
3. Go to **Developers → API keys** and copy the **Secret key**
   (`sk_test_...`).
4. Put it in `.env.local`:

   ```
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
   ```

   ⚠️ Never prefix this with `NEXT_PUBLIC_` — that would ship your secret
   key to the browser. It is only ever read inside `/api/checkout`.
5. Restart `npm run dev`. Clicking **Pay & confirm** now redirects to
   Stripe's hosted checkout page. Pay with the test card
   `4242 4242 4242 4242`, any future expiry, any CVC.
6. After payment Stripe redirects back to `/dashboard/ticket?session_id=...`.
   The app then re-checks the session **server-side** (`GET /api/checkout`)
   and only issues the ticket if Stripe reports `payment_status: paid` —
   so a user can't fake a booking by editing the URL.

### Duffel (real flight search + ticketing)

1. Sign up at <https://app.duffel.com/join> — the test environment is free.
2. Go to **Settings → Access tokens**, create a **test** token
   (`duffel_test_...`) and copy it.
3. Put it in `.env.local`:

   ```
   DUFFEL_API_KEY=duffel_test_xxxxxxxxxxxxxxxx
   ```
4. Restart `npm run dev` and search again — fares now come from real
   airlines. Duffel test offers expire in a few minutes, so if you leave
   the page open and then pay, order creation may fail; the app catches
   that and issues a demo confirmation rather than losing the payment.
5. Passenger details sent to Duffel (date of birth, email, phone) are
   demo placeholders in `/api/flights/book`. For anything beyond a
   portfolio demo, collect those from the applicant in a proper form.

**Money flow note:** in this demo, Stripe charges the applicant and Duffel
is paid from your Duffel **balance** (test balance in test mode). A real
product would reconcile the two and handle refunds/cancellations — worth
saying out loud in an interview, it shows you know where the edges are.

---

## 8d. Accounts & cross-device access (Supabase Auth)

Optional, like everything else — without it the app still works, it just
stores the application in one browser.

1. Finish section 6 first (Supabase URL + anon key in `.env.local`, and
   run `supabase/schema.sql`). The schema now includes a `user_id` column
   and Row Level Security policies that scope each row to its owner.
2. In the Supabase dashboard go to **Authentication → Providers → Email**
   and make sure Email is enabled.
3. For local testing, turn **Confirm email** off (same screen) so a new
   account can sign in immediately. Leave it on in production.
4. Restart `npm run dev`, then open `/login` (there's a **Sign in** link in
   the navbar) and create an account.

How it behaves:

- Sign in **before** submitting an application and the application is
  stamped with your `user_id`.
- Open `/dashboard` on any other device, sign in with the same email, and
  the app loads your most recent application automatically.
- Applications created while signed out have `user_id = null`, stay
  visible in that browser, and don't belong to anyone — that's what keeps
  the no-setup demo working.
- RLS means a signed-in user can never read someone else's row, even if
  they guess the application id.

---

## 8e. Seat & baggage selection

After picking a fare the applicant lands on a seat map before paying:

- Seats are split into **extra legroom** (exit row), **front of cabin**,
  and **standard**, each with its own fee; Business fares get every seat
  free. Taken seats are deterministic per offer, so the map looks the same
  every time you reload.
- Baggage offers three allowances, priced differently for Economy vs
  Business.
- Seat and baggage fees are added as **separate Stripe line items** and
  re-priced server-side in `/api/checkout` — the client can't send its own
  total. The chosen seat then prints on the boarding pass.

Real seat maps: Duffel exposes them at `GET /air/seat_maps?offer_id=...`,
and baggage as `services` on an order. `src/lib/seatmap.ts` is the single
file you'd swap out to use them.

---

## 8f. Still left to build

**Webhooks instead of redirect verification** — right now payment is
verified when the user lands back on the page. A production build would
also listen to Stripe's `checkout.session.completed` webhook so a closed
tab can't lose a paid booking.

**Refunds & cancellations** through Duffel's order-change endpoints.

**Admin/officer panel** — a second role that can review applications,
watch interview recordings, and override an AI decision. That's the piece
most immigration-SaaS teams will ask about.

---

## 9. Design notes

Palette is a deep "night flight" navy (`#0b1220`) with a brass/gold accent
(`#b8925a`) — deliberately avoiding the generic cream-background /
terracotta-accent look. Headlines use **Fraunces** (serif), body text uses
**Inter**. Country cards use hand-drawn line-art landmark icons by
default, so there's never a broken image link — add a `heroImageUrl` per
country in `src/lib/countries.ts` (see section 4 above) the moment you
have real photography to show instead.
