import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const tokenSecret = process.env.PAYMENT_TOKEN_SECRET;

  if (!stripeKey || !tokenSecret) {
    console.error("Missing STRIPE_SECRET_KEY or PAYMENT_TOKEN_SECRET env vars");
    return NextResponse.json({ error: "Payment verification not configured" }, { status: 500 });
  }

  // Verify with Stripe REST API directly — no Stripe npm package needed
  let session: { payment_status: string; status: string };
  try {
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    if (!stripeRes.ok) {
      return NextResponse.json({ error: "Invalid Stripe session" }, { status: 400 });
    }
    session = await stripeRes.json();
  } catch {
    return NextResponse.json({ error: "Stripe API unreachable" }, { status: 502 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  // Build a stateless signed token — no database required
  // Payload: { paid: true, exp: <timestamp ms>, v: 1 }
  const exp = Date.now() + 180 * 24 * 60 * 60 * 1000; // 180 days
  const payload = Buffer.from(JSON.stringify({ paid: true, exp, v: 1 })).toString("base64url");
  const sig = createHmac("sha256", tokenSecret).update(payload).digest("hex");
  const token = `${payload}.${sig}`;

  return NextResponse.json({ token });
}
