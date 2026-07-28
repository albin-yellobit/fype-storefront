import { NextResponse } from "next/server";
import { clearServerAuthCookie } from "@/lib/server-auth";

export async function POST() {
    await clearServerAuthCookie();
    return NextResponse.json({ success: true });
}
