# VisaAI — Complete Setup Guide

Ek hi jagah par: kya install karna hai, kaunsi keys kahan se leni hain,
kaunsi SQL run karni hai, aur kaise verify karna hai ki sab chal raha hai.

Zaroori baat: **kuch bhi setup kiye baghair bhi app chal jati hai.** Har
integration ka local fallback maujood hai. Keys tab daalo jab wo feature
"asli" chahiye ho.

---

## Step 0 — Computer par kya install hona chahiye

| Cheez | Version | Kahan se |
|---|---|---|
| **Node.js** | 20 ya usse upar (22 LTS best) | <https://nodejs.org> — "LTS" wala button |
| **npm** | Node ke saath khud aa jata hai | — |
| Code editor | koi bhi | VS Code recommended |
| Browser | **Chrome ya Edge** | Voice interview ke liye zaroori (Web Speech API) |

Check karne ke liye terminal mein:

```bash
node -v     # v20.x ya v22.x aana chahiye
npm -v
```

> Kuch aur globally install karne ki **zarurat nahi** — koi Python, koi
> Docker, koi database local par nahi chahiye. Supabase cloud par hai.

---

## Step 1 — Project run karo

```bash
# 1. zip extract karo, phir folder ke andar jao
cd visaai

# 2. saare packages install karo (2-3 minute lagte hain)
npm install

# 3. chalao
npm run dev
```

Browser mein kholo: <http://localhost:3000>

Abhi bhi poora flow chalega (demo mode mein): apply → documents →
interview → scoring → flight → seat → boarding pass.

### npm install kya kya lagata hai (tumhe alag se kuch nahi karna)

`package.json` mein already likha hua hai, `npm install` khud le aata hai:

- `next`, `react`, `react-dom` — framework
- `typescript`, `@types/*` — types
- `tailwindcss`, `@tailwindcss/postcss` — styling
- `framer-motion` — animations
- `lucide-react` — icons
- `@supabase/supabase-js` — database + auth
- `next-cloudinary` — upload helper
- `clsx` — class helper
- `eslint`, `eslint-config-next` — linting

**Stripe aur Duffel ka koi npm package install nahi karna** — dono ko
maine seedha `fetch` se REST API par call kiya hai, taake koi extra
dependency na ho.

---

## Step 2 — .env.local bharo

`.env.local` file project ki root mein already maujood hai (package.json
ke saath). Usme har variable ke upar comment likha hai ki key kahan se
milegi. Sirf `=` ke aage value paste karni hai.

Ek nazar mein:

| Variable | Kiske liye | Na daalo to kya hoga |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | document/video upload | upload fail hoga |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | document/video upload | upload fail hoga |
| `NEXT_PUBLIC_SUPABASE_URL` | database + login | localStorage par chalega |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | database + login | localStorage par chalega |
| `ANTHROPIC_API_KEY` | asli AI scoring | keyword heuristic se scoring |
| `STRIPE_SECRET_KEY` | asli card payment | payment simulate hoga |
| `DUFFEL_API_KEY` | asli flight search | demo fares dikhenge |

⚠️ `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `DUFFEL_API_KEY` par kabhi
`NEXT_PUBLIC_` mat lagana — wo secret hain aur sirf server par read hoti
hain.

**Har baar `.env.local` badalne ke baad `npm run dev` band karke dobara
chalao** (Ctrl+C, phir `npm run dev`). Next.js env variables sirf start
par parhta hai.

---

## Step 3 — SQL (sirf Supabase use karna ho tab)

Supabase dashboard → apna project → left sidebar mein **SQL Editor** →
**New query** → neeche wala poora code paste karo → **Run**.

### SQL #1 — Naya database (pehli baar)

Yehi code `supabase/schema.sql` file mein bhi hai.

```sql
-- Table applications
create table if not exists applications (
  id text primary key,
  country_code text not null,
  visa_type text not null,
  full_name text not null,
  status text not null default 'documents_pending',
  documents jsonb not null default '[]',
  interview_slot jsonb,
  score int,
  decision_reason text,
  interview_video_url text,
  booking jsonb,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on applications (user_id);

-- Row Level Security ON
alter table applications enable row level security;

-- Purani demo policies hata do (agar pehle bani thin)
drop policy if exists "public read" on applications;
drop policy if exists "public insert" on applications;
drop policy if exists "public update" on applications;

-- Nayi policies: signed-in banda sirf apni rows dekhe.
-- user_id null wali rows "guest" applications hain (bina login ke banayi hui).
create policy "own or guest read" on applications
  for select using (user_id is null or auth.uid() = user_id);

create policy "own or guest insert" on applications
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "own or guest update" on applications
  for update using (user_id is null or auth.uid() = user_id);

create policy "own delete" on applications
  for delete using (auth.uid() = user_id);
```

### SQL #2 — Agar table pehle se bani hui hai (upgrade)

Agar tumne pehle wala schema chala rakha tha, to table dobara mat banao —
sirf yeh chala do:

```sql
alter table applications add column if not exists booking jsonb;

alter table applications add column if not exists user_id uuid
  references auth.users (id) on delete set null;

create index if not exists applications_user_id_idx on applications (user_id);

alter table applications enable row level security;

drop policy if exists "public read" on applications;
drop policy if exists "public insert" on applications;
drop policy if exists "public update" on applications;

create policy "own or guest read" on applications
  for select using (user_id is null or auth.uid() = user_id);

create policy "own or guest insert" on applications
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "own or guest update" on applications
  for update using (user_id is null or auth.uid() = user_id);

drop policy if exists "own delete" on applications;

create policy "own delete" on applications
  for delete using (auth.uid() = user_id);
```

### SQL #3 — Sab kuch reset karna ho (testing ke liye)

```sql
delete from applications;
```

Poori table hi uda deni ho to:

```sql
drop table if exists applications;
```

…phir SQL #1 dobara run kar lena.

### Check karne ke liye (optional)

```sql
-- kitni applications hain
select id, full_name, status, user_id, created_at
from applications
order by created_at desc;

-- columns theek hain ya nahi
select column_name, data_type
from information_schema.columns
where table_name = 'applications';
```

---

## Step 4 — Login on karo (Supabase Auth)

Supabase dashboard mein:

1. **Authentication → Providers → Email** → ON.
2. Usi screen par **Confirm email** → **OFF** (sirf local testing ke liye;
   production mein ON rakhna, warna koi bhi kisi ka email daal sakta hai).
3. `npm run dev` restart karo.
4. App mein navbar se **Sign in** → **Create account** → email + password
   (kam se kam 6 characters).

Ab: sign in karke application submit karo → dusre device/browser par usi
email se login karo → `/dashboard` khud tumhari application le aayega.

Banaye hue users yahan dikhte hain: **Authentication → Users**.

### Signup form

Signup par ab **full name**, **email**, **password**, aur **confirm
password** char fields hain — dono password fields match nahi karenge to
button disabled rahega aur error dikh jayega.

---

## Step 4.1 — Forget password (email link)

1. Dashboard mein **Authentication → URL Configuration**:
   - **Site URL** apna deployed domain daalo (local testing ke liye
     `http://localhost:3000`).
   - **Redirect URLs** mein `http://localhost:3000/reset-password` (aur
     production URL ka `/reset-password` bhi) add karo — warna emailed
     link kaam nahi karega.
2. (Optional, lekin recommended) Email ko luxury design dena ho:
   **Authentication → Email Templates → Reset Password** kholo, aur
   `supabase/email-templates/reset-password.html` ka poora code paste
   karke Save kar do. Yeh file already project mein maujood hai.
3. App mein flow: `/login` → **Forgot password?** → email daalo → link
   apne inbox mein khol ke naya password + confirm new password bharo →
   account `/profile` par khul jayega, wahi se dobara login use ho sakta
   hai.

## Step 4.2 — Delete account (permanent)

Yeh feature ek extra **secret** key maangta hai (alag from anon key):

1. Dashboard → **Settings → API** → **Project API keys** ke neeche
   **service_role** key copy karo (⚠️ yeh secret hai, kabhi frontend/
   browser mein mat bhejna).
2. `.env.local` mein `SUPABASE_SERVICE_ROLE_KEY=` ke aage paste karo.
3. Restart (`npm run dev`).
4. `/profile` page par **Delete account** button click karne par ek
   confirm/cancel modal khulta hai — **Confirm** click karne se account
   ki application rows aur login dono permanently mit jate hain aur
   banda home page par bhej diya jata hai; **Cancel** se kuch nahi hota.

Key na daalo to: baaki poori app normal chalegi, sirf "Delete account"
button click karne par ek error message dikhega.

---

## Step 5 — Cloudinary (upload)

1. Free account: <https://cloudinary.com/users/register_free>
2. Dashboard par **Cloud name** copy → `.env.local` mein paste.
3. **Settings → Upload → Upload presets → Add upload preset**
   - **Signing Mode: Unsigned** (yeh sabse zaroori step hai)
   - Save karke preset ka **naam** copy → `.env.local` mein paste.
4. Restart. Ab `/apply/documents` par file upload ho kar Cloudinary par
   chali jayegi, aur interview ki recording `visaai/interviews` folder
   mein aayegi.

---

## Step 6 — Anthropic (asli AI scoring)

1. <https://console.anthropic.com> → **API Keys** → Create key.
2. `.env.local` mein `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart.

Ab interview ke answers Claude ko jate hain aur wo score + approve/reject
+ reason wapas deta hai. Key na ho to app khud local heuristic par chali
jati hai — kabhi crash nahi karti.

---

## Step 7 — Stripe (payment)

1. <https://dashboard.stripe.com/register> → account.
2. Upar right **Test mode** ON.
3. **Developers → API keys → Secret key** copy (`sk_test_...`).
4. `.env.local` mein `STRIPE_SECRET_KEY=sk_test_...` → restart.

Test karne ke liye card: `4242 4242 4242 4242`, expiry koi bhi future
date (12/34), CVC koi bhi (123), ZIP koi bhi.

Payment ke baad Stripe wapas `/dashboard/ticket` par bhejta hai aur app
**server par** check karti hai ke payment waqai hui thi — URL edit karke
koi muft ticket nahi bana sakta.

---

## Step 8 — Duffel (asli flights)

1. <https://app.duffel.com/join> → sign up (test free hai).
2. **Settings → Access tokens → Create access token** → Environment:
   **Test** → copy (`duffel_test_...`).
3. `.env.local` mein `DUFFEL_API_KEY=duffel_test_...` → restart.

Note: Duffel ke test offers 2-3 minute mein expire ho jate hain. Agar
search karke bohot der baad pay karo to order fail ho sakta hai — app usse
pakad leti hai aur demo confirmation issue kar deti hai, paisa phase nahi
hota.

---

## Step 9 — Sab chal raha hai? Yeh checklist chala lo

```bash
npm run build      # zero errors aane chahiye
npx tsc --noEmit   # zero errors
npx eslint .       # zero errors
```

Phir browser mein:

1. `/` — landing page khulta hai, animations chalte hain ✅
2. `/login` — account ban jata hai (Supabase on ho to) ✅
3. `/apply` — country + visa type select ✅
4. `/apply/documents` — file upload ho kar Cloudinary link banta hai ✅
5. `/apply/review` → submit → `/dashboard` par status timeline ✅
6. `/interview` — Voice ya Typed choose karo; dusri tab par jao 2 baar →
   auto reject hona chahiye ✅ ; answer paste karne ki koshish karo →
   turant reject ✅
7. Approve hone par `/dashboard/ticket` — flight search → seat map →
   baggage → pay → boarding pass ✅

---

## Common masle aur unka hal

| Problem | Wajah / Hal |
|---|---|
| `npm install` par error | Node version purana hai — Node 20+ install karo |
| Build par font download fail | Internet band hai. Online hote hi theek ho jayega |
| Upload par "Upload failed" | Cloudinary preset **Unsigned** nahi hai, ya preset ka naam galat hai |
| Login par "Invalid login credentials" | Password galat, ya "Confirm email" ON hai aur email confirm nahi kiya |
| Dashboard khaali hai | Us browser mein application nahi bani. Sign in karke dekho, ya nayi application banao |
| Voice button disabled | Safari/Firefox hai. Chrome ya Edge use karo, ya Typed mode |
| Stripe par "No such price" type error | `.env.local` change ke baad `npm run dev` restart nahi kiya |
| Env change ka asar nahi ho raha | Server restart karna bhool gaye (Ctrl+C phir `npm run dev`) |
| Supabase par "permission denied" | SQL wali policies run nahi ki. Step 3 dobara chalao |

---

## Vercel par deploy karna ho to

1. Code GitHub par push karo (`.env.local` push **nahi** hoti — sahi hai).
2. <https://vercel.com> → New Project → apna repo import karo.
3. **Settings → Environment Variables** mein `.env.local` wali saari
   values ek ek karke daal do (wahi naam, wahi value).
4. Deploy. Bas.

Stripe ke redirect URLs app khud request ke domain se bana leti hai, to
Vercel par alag se kuch configure nahi karna.
