import { NextRequest, NextResponse } from "next/server";
import { signUserData } from "@/lib/auth-signature";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, ...userData } = body;

    if (!signature || !userData.name || !userData.role) {
      console.warn("[verify] missing fields", { hasSig: !!signature, name: userData.name, role: userData.role });
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const expectedSignature = signUserData(userData);
    const match = signature === expectedSignature;

    if (!match) {
      console.warn("[verify] signature mismatch", {
        name: userData.name,
        role: userData.role,
        adopter: userData.adopter,
        secretLoaded: !!process.env.APP_SIGNATURE_SECRET,
        receivedSig: signature?.slice(0, 12) + "…",
        expectedSig: expectedSignature.slice(0, 12) + "…",
      });
    }

    if (match) return NextResponse.json({ valid: true });
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    console.error("[verify] threw:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
