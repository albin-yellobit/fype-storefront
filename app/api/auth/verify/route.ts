import { NextRequest, NextResponse } from "next/server";
import { setServerAuthCookie } from "@/lib/server-auth";

// Called client-side right after a successful OTP login (see verifyOTP thunk in
// userSlice.ts). The client already holds a valid token from the backend at
// this point — this route just mirrors it into an httpOnly cookie on the
// storefront's own origin so Server Components can read the same identity.
export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    const token = body?.token;

    if (!token || typeof token !== "string") {
        return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    await setServerAuthCookie(token);
    return NextResponse.json({ success: true });
}
