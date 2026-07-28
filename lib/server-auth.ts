import { cookies } from "next/headers";

// The cookie name is deliberately distinct from the backend's own `customer_token`
// cookie (see crmApp's customer-auth.middleware.ts) — this one lives on the
// storefront's own origin only and is never sent to the backend automatically.
// Server Components/Route Handlers read it and forward the value themselves as
// `Authorization: Bearer <token>` when calling the backend.
export const AUTH_COOKIE_NAME = "sf_customer_token";

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // matches the backend's own token lifetime

export async function getServerAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function setServerAuthCookie(token: string): Promise<void> {
    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });
}

export async function clearServerAuthCookie(): Promise<void> {
    const store = await cookies();
    store.delete(AUTH_COOKIE_NAME);
}
