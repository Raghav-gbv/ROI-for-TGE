'use client';

import React, { useMemo, useRef, useState } from 'react';

type CurrencyCode = 'USD' | 'EUR' | 'AED' | 'GBP' | 'SAR' | 'INR';

const CURRENCIES: CurrencyCode[] = ['USD','EUR','AED','GBP','SAR','INR'];
const LOCALES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ar-AE', label: 'العربية (الإمارات)' },
];

export default function Page() {
  const logoSrc = '/tge-logo.png';

  // Currency & locale
  const [currency, setCurrency] = useState<CurrencyCode>('AED');
  const [locale, setLocale] = useState<string>('en-GB');

  // Base inputs
  const [presses, setPresses] = useState<number>(9);
  const [plateRemakesPerMonth, setPlateRemakesPerMonth] = useState<number>(30);
  const [downtimeHoursPerMonth, setDowntimeHoursPerMonth] = useState<number>(12);
  const [costPerPlate, setCostPerPlate] = useState<number>(150);
  const [downtimeCostPerHour, setDowntimeCostPerHour] = useState<number>(1000);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [materialSpendPerMonth, setMaterialSpendPerMonth] = useState<number>(20000);
  const [wastePercent, setWastePercent] = useState<number>(5);

  // Improvements
  const [remakeReductionPct, setRemakeReductionPct] = useState<number>(20);
  const [downtimeReductionPct, setDowntimeReductionPct] = useState<number>(25);
  const [wasteReductionPct, setWasteReductionPct] = useState<number>(15);

  // Investment
  const [oneTimeSetup, setOneTimeSetup] = useState<number>(12000);
  const [annualLicense, setAnnualLicense] = useState<number>(18000);

  // Lead modal gate
  const [leadOpen, setLeadOpen] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadCompany, setLeadCompany] = useState<string>('');

  const pdfRef = useRef<HTMLDivElement>(null);

  // --- Calculations ---
  const fmt = (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Math.max(0, n));
  const pct = (n: number) => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)}%`;

  const annualRemakeSavings = useMemo(() =>
    plateRemakesPerMonth * costPerPlate * (remakeReductionPct / 100) * 12,
  [plateRemakesPerMonth, costPerPlate, remakeReductionPct]);

  const annualDowntimeSavings = useMemo(() =>
    downtimeHoursPerMonth * downtimeCostPerHour * (downtimeReductionPct / 100) * 12,
  [downtimeHoursPerMonth, downtimeCostPerHour, downtimeReductionPct]);

  const annualWasteSavings = useMemo(() => {
    if (!showAdvanced) return 0;
    return materialSpendPerMonth * (wastePercent / 100) * (wasteReductionPct / 100) * 12;
  }, [showAdvanced, materialSpendPerMonth, wastePercent, wasteReductionPct]);

  const totalAnnualSavings = annualRemakeSavings + annualDowntimeSavings + annualWasteSavings;

  const year0Cost = oneTimeSetup + annualLicense;
  const subsequentAnnualCost = annualLicense;

  const roiYear0 = ((totalAnnualSavings - year0Cost) / Math.max(1, year0Cost)) * 100;
  const roiYear1Plus = ((totalAnnualSavings - subsequentAnnualCost) / Math.max(1, subsequentAnnualCost)) * 100;
  const paybackMonths = totalAnnualSavings > 0 ? Math.max(0, (year0Cost / (totalAnnualSavings / 12))) : Infinity;

  const reset = () => {
    setPresses(9);
    setPlateRemakesPerMonth(30);
    setDowntimeHoursPerMonth(12);
    setCostPerPlate(150);
    setDowntimeCostPerHour(1000);
    setShowAdvanced(false);
    setMaterialSpendPerMonth(20000);
    setWastePercent(5);
    setRemakeReductionPct(20);
    setDowntimeReductionPct(25);
    setWasteReductionPct(15);
    setOneTimeSetup(12000);
    setAnnualLicense(18000);
  };

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadCompany) return;

    // send to API (optional: set ZAPIER_WEBHOOK_URL in Vercel env)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          company: leadCompany,
          locale, currency,
          inputs: {
            presses, plateRemakesPerMonth, downtimeHoursPerMonth,
            costPerPlate, downtimeCostPerHour, showAdvanced,
            materialSpendPerMonth, wastePercent, remakeReductionPct,
            downtimeReductionPct, wasteReductionPct, oneTimeSetup, annualLicense
          },
          outputs: {
            annualRemakeSavings, annualDowntimeSavings, annualWasteSavings,
            totalAnnualSavings, year0Cost, subsequentAnnualCost, roiYear0, roiYear1Plus, paybackMonths
          }
        })
      });
    } catch (e) {
      console.warn('Lead capture failed (demo mode)', e);
    }

    setLeadOpen(false);
    await generatePDF();
  }

  async function generatePDF() {
    if (!pdfRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header
    try { pdf.addImage(logoSrc, 'PNG', 24, 24, 120, 32); } catch {}
    pdf.setFontSize(14);
    pdf.text('Track&Trace4Tools – Detailed ROI Report', 24, 72);

    // Content
    const imgWidth = pageWidth - 48;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 24, 90, imgWidth, imgHeight);

    pdf.save('TGE_TrackTrace4Tools_ROI_Report.pdf');
  }

  return (
    <div className="min-h-screen p-6 md:p-10" ref={pdfRef}>
      <div className="max-w-6xl mx-auto grid gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="The Grey Elephant" className="h-10 w-auto" />
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Track&Trace4Tools ROI Calculator</h1>
              <p className="text-slate-600 mt-1">Estimate annual savings from fewer plate remakes, reduced press downtime, and lower waste — in minutes.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white border rounded-2xl px-3 py-2 shadow-soft">
              <span className="text-sm text-slate-600">Locale</span>
              <select className="bg-transparent outline-none" value={locale} onChange={(e)=>setLocale(e.target.value)}>
                {LOCALES.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
              </select>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-600">Currency</span>
              <select className="bg-transparent outline-none" value={currency} onChange={(e)=>setCurrency(e.target.value as CurrencyCode)}>
                {CURRENCIES.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <button onClick={() => window.print()} className="rounded-2xl px-4 py-2 border bg-white shadow-soft text-sm">Save Page as PDF</button>
            <button onClick={reset} className="rounded-2xl px-4 py-2 border bg-white shadow-soft text-sm">Reset</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat title="Estimated Annual Savings" value={fmt(totalAnnualSavings)} subtitle="Live estimate based on your inputs" />
          <Stat title="Year 0 ROI" value={pct(roiYear0)} subtitle="Includes setup + license" />
          <Stat title="Year 1+ ROI" value={pct(roiYear1Plus)} subtitle="Ongoing years (license only)" />
          <Stat title="Payback Period" value={isFinite(paybackMonths) ? `${Math.round(paybackMonths)} months` : '-'} subtitle="Break-even (Year 0)" />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Company Snapshot */}
          <Card>
            <h2 className="card-title">Company Snapshot</h2>
            <Field label="Number of presses" hint="Typical label/packaging sites run 6–12.">
              <input type="number" min={1} value={presses} onChange={(e)=>setPresses(Number(e.target.value || 0))} className="input" />
            </Field>
            <Field label="Plate remakes per month" hint="How many plates are unnecessarily remade today?">
              <input type="number" min={0} value={plateRemakesPerMonth} onChange={(e)=>setPlateRemakesPerMonth(Number(e.target.value || 0))} className="input" />
            </Field>
            <Field label="Plate-related downtime (hours/month)" hint="Estimate press downtime traced to plate/tool issues.">
              <input type="number" min={0} value={downtimeHoursPerMonth} onChange={(e)=>setDowntimeHoursPerMonth(Number(e.target.value || 0))} className="input" />
            </Field>
          </Card>

          {/* Cost Factors */}
          <Card>
            <h2 className="card-title">Cost Factors</h2>
            <Field label={`Cost per plate (${currency})`} hint="Plate + handling — currency agnostic.">
              <input type="number" min={0} value={costPerPlate} onChange={(e)=>setCostPerPlate(Number(e.target.value || 0))} className="input" />
            </Field>
            <Field label={`Downtime cost per hour (${currency})`} hint="Labor + waste + lost contribution margin.">
              <input type="number" min={0} value={downtimeCostPerHour} onChange={(e)=>setDowntimeCostPerHour(Number(e.target.value || 0))} className="input" />
            </Field>

            <div className="pt-2">
              <button className="rounded-xl px-3 py-2 border text-sm bg-white" onClick={()=>setShowAdvanced(v=>!v)}>
                {showAdvanced ? 'Hide' : 'Show'} advanced waste inputs
              </button>
              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <Field label={`Material spend per month (${currency})`} hint="Used to estimate waste savings.">
                    <input type="number" min={0} value={materialSpendPerMonth} onChange={(e)=>setMaterialSpendPerMonth(Number(e.target.value || 0))} className="input" />
                  </Field>
                  <Field label="Waste % attributable to plate/tool issues" hint="If unsure, keep 5%">
                    <input type="number" min={0} max={100} value={wastePercent} onChange={(e)=>setWastePercent(Number(e.target.value || 0))} className="input" />
                  </Field>
                </div>
              )}
            </div>
          </Card>

          {/* Improvements & Investment */}
          <Card>
            <h2 className="card-title">Expected Improvements</h2>

            <SliderField label={`Remake reduction: ${remakeReductionPct}%`} min={0} max={50} value={remakeReductionPct} setValue={setRemakeReductionPct} hint="Benchmark 15–25% with Track&Trace4Tools." />
            <SliderField label={`Downtime reduction: ${downtimeReductionPct}%`} min={0} max={50} value={downtimeReductionPct} setValue={setDowntimeReductionPct} hint="Benchmark 20–30% with proactive plate status." />
            <SliderField label={`Waste reduction: ${wasteReductionPct}%`} min={0} max={40} value={wasteReductionPct} setValue={setWasteReductionPct} hint="Benchmark 10–20% if waste is tracked." />

            <div className="h-px bg-slate-200 my-2" />
            <h2 className="card-title">Investment (editable)</h2>
            <Field label={`One-time setup (${currency})`}>
              <input type="number" min={0} value={oneTimeSetup} onChange={(e)=>setOneTimeSetup(Number(e.target.value || 0))} className="input" />
            </Field>
            <Field label={`Annual license (${currency})`}>
              <input type="number" min={0} value={annualLicense} onChange={(e)=>setAnnualLicense(Number(e.target.value || 0))} className="input" />
            </Field>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <h2 className="card-title">Savings Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Savings from fewer plate remakes</h3>
              <p className="text-3xl font-semibold mt-2">{fmt(annualRemakeSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">= Remakes/month × Cost/plate × Reduction × 12</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Savings from reduced downtime</h3>
              <p className="text-3xl font-semibold mt-2">{fmt(annualDowntimeSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">= Downtime hrs/month × Cost/hr × Reduction × 12</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Savings from lower waste</h3>
              <p className="text-3xl font-semibold mt-2">{fmt(annualWasteSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">= Material spend × Waste% × Reduction × 12</p>
            </div>
          </div>

          <div className="h-px bg-slate-200 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat title="Year 0 Cost" value={fmt(year0Cost)} subtitle="Setup + license" />
            <Stat title="Year 1+ Cost" value={fmt(subsequentAnnualCost)} subtitle="Annual license only" />
            <Stat title="Total Annual Savings" value={fmt(totalAnnualSavings)} subtitle="Remakes + downtime + waste" />
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Notes: Results are indicative and depend on accurate inputs. Track&Trace4Tools improves data quality by tracking running meters and tool status,
            enabling proactive planning and fewer failures. Currency is display-only.
          </p>
        </Card>

        {/* CTA - gated */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border rounded-2xl p-5 shadow-soft">
          <div>
            <div className="text-lg font-semibold">Get your Detailed PDF Report</div>
            <div className="text-slate-600 text-sm">Enter your details to download a branded report with inputs & calculations you can share internally.</div>
          </div>
          <button className="rounded-2xl px-4 py-2 bg-sky-500 text-white shadow-soft" onClick={()=>setLeadOpen(true)}>
            Get Full ROI Report
          </button>
        </div>

        {/* Modal */}
        {leadOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold">Get your detailed ROI report</h3>
              <p className="text-slate-600 text-sm">Fill this quick form to download your PDF. We’ll also email the results if needed.</p>
              <form className="mt-4 space-y-4" onSubmit={handleLeadSubmit}>
                <Field label="Name">
                  <input className="input" value={leadName} onChange={(e)=>setLeadName(e.target.value)} placeholder="Jane Doe" />
                </Field>
                <Field label="Work Email">
                  <input className="input" type="email" value={leadEmail} onChange={(e)=>setLeadEmail(e.target.value)} placeholder="name@company.com" />
                </Field>
                <Field label="Company">
                  <input className="input" value={leadCompany} onChange={(e)=>setLeadCompany(e.target.value)} placeholder="Company Ltd." />
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="rounded-2xl px-4 py-2 border" onClick={()=>setLeadOpen(false)}>Cancel</button>
                  <button type="submit" className="rounded-2xl px-4 py-2 bg-sky-500 text-white disabled:opacity-50" disabled={!leadName || !leadEmail || !leadCompany}>Download PDF</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Stat({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-soft">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white p-6 shadow-soft space-y-4">{children}</div>;
}

function Field({ label, children, hint }: { label: string, children: React.ReactNode, hint?: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-700">{label}</div>
      {children}
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SliderField({ label, value, setValue, min, max, hint }:{ label: string, value: number, setValue: (v:number)=>void, min:number, max:number, hint?:string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div>
      <input type="range" min={min} max={max} step={1} value={value} onChange={(e)=>setValue(Number(e.target.value))} className="w-full" />
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
