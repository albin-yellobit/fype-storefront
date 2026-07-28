import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant";

export async function middleware(request: NextRequest) {
    const host = request.headers.get("host") ?? "";
    const domain = host.split(":")[0];

    const tenant = await resolveTenant(domain);

    const requestHeaders = new Headers(request.headers);
    if (tenant) {
        requestHeaders.set("x-shop-id", tenant.shopId);
        requestHeaders.set("x-store-domain", tenant.storeDomain);
        requestHeaders.set("x-theme-id", tenant.themeId);
    }

    // Catalog-browse theme preview (Phase 4): forwarded as a header rather than
    // read from searchParams downstream, since layouts (unlike pages) don't
    // receive searchParams in the App Router — this is the one place both the
    // layout (theme resolution) and every page (dummy vs. real data) can read
    // it from. Real validation (does this template exist / is it active)
    // happens where it's consumed, not here.
    const previewTemplateId = request.nextUrl.searchParams.get("previewTheme");
    if (previewTemplateId) {
        requestHeaders.set("x-preview-template-id", previewTemplateId);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
