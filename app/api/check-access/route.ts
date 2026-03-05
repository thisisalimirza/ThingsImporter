import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Dev bypass: set BYPASS_PAYMENT=true in .env.local to skip payment gate
  if (process.env.BYPASS_PAYMENT === "true") {
    return NextResponse.json({ valid: true });
  }

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ valid: false });
  }

  if (!token || typeof token !== "string") {
    return NextResponse.json({ valid: false });
  }

  const tokenSecret = process.env.PAYMENT_TOKEN_SECRET;
  if (!tokenSecret) {
    return NextResponse.json({ valid: false });
  }

  const parts = token.split(".");
  if (parts.length !== 2) return NextResponse.json({ valid: false });

  const [payload, sig] = parts;

  // Recompute HMAC and do timing-safe comparison
  const expectedSig = createHmac("sha256", tokenSecret).update(payload).digest("hex");
  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return NextResponse.json({ valid: false });
    if (!timingSafeEqual(sigBuf, expectedBuf)) return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false });
  }

  // Verify expiry
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof decoded.exp !== "number" || decoded.exp < Date.now()) {
      return NextResponse.json({ valid: false });
    }
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
