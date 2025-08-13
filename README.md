# The Grey Elephant – Track&Trace4Tools ROI Calculator (Next.js)

A ready-to-deploy Next.js app with TGE branding, currency/locale selector, lead-capture gate, and PDF export.

## 🚀 One-time setup

1. **Download & unzip** this project.
2. `cd tge-roi-nextjs`
3. `npm install`
4. `npm run dev` → open http://localhost:3000

## 🌐 Deploy to Vercel (no 404s)

1. Push this folder to a **new GitHub repo**.
2. In Vercel → **Add New Project** → import your repo.
3. Framework preset: **Next.js** (auto-detected). Keep defaults.
4. Deploy. Your public URL will open on `/` with the calculator.

> If you see a 404, make sure this app is at the repo root and **`app/page.tsx`** exists. Vercel serves `/` from there.

## 🧩 Branding

- Replace `public/tge-logo.png` with your real logo (same file name) for instant branding.

## 💱 Currency & locale

- Top-right picker updates formatting using `Intl.NumberFormat` for currencies: **AED/EUR/USD/GBP/SAR/INR** and locales: **en-GB, en-US, de-DE, ar-AE**.

## 🔒 Lead capture (gated PDF)

- Button **Get Full ROI Report** opens a form (name/email/company).
- On submit, details POST to `/api/lead` then a **PDF** is generated (html2canvas + jsPDF).

### Optional: Send leads to Zapier/Make
- In Vercel → Project → **Settings → Environment Variables** add:
  - `ZAPIER_WEBHOOK_URL = https://hooks.zapier.com/...`
- Re-deploy. Submissions will also be forwarded to your webhook.

## 🧠 How to customize defaults

Open `app/page.tsx` and change the initial values near the top:
```ts
const [plateRemakesPerMonth, setPlateRemakesPerMonth] = useState(30);
const [downtimeHoursPerMonth, setDowntimeHoursPerMonth] = useState(12);
const [costPerPlate, setCostPerPlate] = useState(150);
...
```

## 🧰 Tech

- Next.js 14 (App Router), React 18, Tailwind CSS
- html2canvas, jsPDF for PDF
- No database required

## ✅ License
Private to The Grey Elephant.
