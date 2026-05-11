import { NextRequest, NextResponse } from "next/server";
import { signUserData } from "@/lib/auth-signature";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, ...userData } = body;

    if (!signature || !userData.name || !userData.role) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Recalculamos la firma con el secreto del servidor
    const expectedSignature = signUserData(userData);

    if (signature === expectedSignature) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
