import { NextResponse, type NextRequest } from "next/server";
import { resolveTenant } from "@/lib/tenant";
import { STOREFRONT_UNLOCK_COOKIE } from "@/lib/storefront-gate";

function skipPasswordGate(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    if (
        pathname.startsWith("/storefront-password") ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/theme-preview")
    ) {
        return true;
    }
    // Theme customizer iframe always loads with this flag — never prompt there.
    return request.nextUrl.searchParams.get("editorPreview") === "1";
}

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

    if (tenant && tenant.isPublished === false && !skipPasswordGate(request)) {
        const unlocked = request.cookies.get(STOREFRONT_UNLOCK_COOKIE)?.value === tenant.shopId;
        if (!unlocked) {
            const url = request.nextUrl.clone();
            const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
            url.pathname = "/storefront-password";
            url.search = "";
            if (returnTo && returnTo !== "/") {
                url.searchParams.set("return_to", returnTo);
            }
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
