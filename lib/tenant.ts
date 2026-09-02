import { getCloudflareContext } from "@opennextjs/cloudflare";

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
        { headers: { "Content-Type": "application/json" } }
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
        // falls back to theme_one until every shop response carries themeId — see Prerequisites in the runbook
        themeId: shop.themeId ?? "theme_one",
        isPublished: shop.isPublished !== false,
    };
}

// Host -> KV (5min TTL) -> GET /shops/by-domain. Called from middleware, so this
// must stay edge-safe (no Node-only APIs, no client-side lib/api.ts).
export async function resolveTenant(domain: string): Promise<TenantInfo | null> {
    const { env } = await getCloudflareContext({ async: true });
    const kv = env.FYPE_TENANT_CACHE;
    const cacheKey = `tenant:${domain}`;

    const cached = await kv.get<TenantInfo>(cacheKey, "json");
    if (cached?.shopId) {
        return {
            ...cached,
            isPublished: cached.isPublished !== false,
        };
    }

    if (!env.API_BASE_URL) throw new Error("API_BASE_URL is not configured");

    let tenant: TenantInfo | null;
    try {
        tenant = await fetchTenantFromApi(domain, env.API_BASE_URL);
    } catch {
        // backend unreachable — fail soft so a page request degrades to the
        // default theme instead of 500ing every request
        return null;
    }
    if (!tenant) return null;

    await kv.put(cacheKey, JSON.stringify(tenant), {
        expirationTtl: tenant.isPublished === false ? 30 : CACHE_TTL_SECONDS,
    });
    return tenant;
}
