import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getApiBaseUrl } from "@/lib/api-base-url";

export type TenantInfo = {
    shopId: string;
    storeDomain: string;
    themeId: string;
    isPublished: boolean;
};

const CACHE_TTL_SECONDS = 300;

async function fetchTenantFromApi(domain: string, apiBaseUrl: string): Promise<TenantInfo | null> {
    const res = await fetch(
        `${apiBaseUrl}/commerce/shops/by-domain?domain=${encodeURIComponent(domain)}`,
        { headers: { "Content-Type": "application/json" }, cache: "no-store" }
    );

    if (!res.ok) return null;

    type ShopResponse = { shopId?: string; themeId?: string; isPublished?: boolean };
    const json = (await res.json()) as {
        shop?: ShopResponse;
        data?: { shop?: ShopResponse };
    } & ShopResponse;
    const shop = json.data?.shop ?? json.shop ?? json;
    if (!shop?.shopId) return null;

    return {
        shopId: shop.shopId,
        storeDomain: domain,
        themeId: shop.themeId ?? "theme_one",
        isPublished: shop.isPublished !== false,
    };
}

async function readTenantCache(domain: string): Promise<TenantInfo | null> {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const cached = await env.FYPE_TENANT_CACHE.get<TenantInfo>(`tenant:${domain}`, "json");
        if (!cached?.shopId) return null;
        return cached;
    } catch {
        return null;
    }
}

async function writeTenantCache(domain: string, tenant: TenantInfo): Promise<void> {
    try {
        const { env } = await getCloudflareContext({ async: true });
        await env.FYPE_TENANT_CACHE.put(`tenant:${domain}`, JSON.stringify(tenant), {
            expirationTtl: tenant.isPublished === false ? 30 : CACHE_TTL_SECONDS,
        });
    } catch {
        // Local next dev may not have KV; password gating still works from the API.
    }
}

// Host -> API (publish state must be fresh) -> KV only as a fallback if the
// backend is unreachable. Called from middleware, so this must stay edge-safe.
export async function resolveTenant(domain: string): Promise<TenantInfo | null> {
    let apiBaseUrl: string | null = null;
    try {
        apiBaseUrl = await getApiBaseUrl();
    } catch {
        apiBaseUrl = null;
    }

    if (apiBaseUrl) {
        try {
            const tenant = await fetchTenantFromApi(domain, apiBaseUrl);
            if (tenant) {
                await writeTenantCache(domain, tenant);
                return tenant;
            }
        } catch {
            // fall through to KV
        }
    }

    const cached = await readTenantCache(domain);
    if (!cached?.shopId) return null;
    return {
        ...cached,
        isPublished: cached.isPublished !== false,
    };
}
