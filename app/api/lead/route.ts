import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));

  // Optional: forward to a Zapier/Make webhook via env var
  try {
    const url = process.env.ZAPIER_WEBHOOK_URL;
    if (url) {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
  } catch (e) {
    console.warn("Webhook forward failed", e);
  }

  // TODO: store in DB or email; for demo we just return ok
  return NextResponse.json({ ok: true });
}
