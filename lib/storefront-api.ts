import { getCloudflareContext } from "@opennextjs/cloudflare";
import type {
    Category,
    Page,
    PageDetail,
    PaginationMeta,
    ProductDetail,
    ProductSortBy,
    ProductVariant,
    ShopIdentity,
    StorefrontProduct,
    ThemeCustomization,
    VariantOptions,
} from "@/types/storefront";

// Store-wide data (theme, nav, catalog) — same for every visitor of a store,
// so these are safe to call from Server Components and let Next's fetch cache/ISR handle freshness.
// Never call these for anything user-specific (cart, auth) — that stays client-side (Phase 2).
//
// Revalidation windows (Phase 7 review, 2026-07-28): split by how often each
// data type actually changes, not one flat window for everything. These are
// reasoned defaults based on data volatility, not tuned against real traffic
// (no production usage data exists yet) — revisit once real merchant/visitor
// patterns are known. All still short enough that a merchant edit is visible
// within a few requests; the split just avoids over-fetching rarely-changing
// data (shop settings, nav links, categories) at the same rate as things that
// churn with normal store activity (new-in/best-sellers, PDP stock/price).
const REVALIDATE_SECONDS = 60; // default, used for anything not called out below
const SHOP_IDENTITY_REVALIDATE = 300; // settings — merchant reconfigures rarely
const PAGES_REVALIDATE = 300; // nav/footer CMS links — rarely change
const CATEGORY_REVALIDATE = 300; // category list/art — rarely changes
const PRODUCT_DETAIL_REVALIDATE = 30; // PDP — stock/price accuracy matters most right at the purchase decision

export async function getApiBaseUrl(): Promise<string> {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.API_BASE_URL) throw new Error("API_BASE_URL is not configured");
    return env.API_BASE_URL;
}

async function fetchJson<T>(url: string, revalidateSeconds: number = REVALIDATE_SECONDS): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
    return res.json() as Promise<T>;
}

export async function getShopByDomain(apiBaseUrl: string, domain: string): Promise<ShopIdentity | null> {
    try {
        const json = await fetchJson<{ data: { shop: ShopIdentity } }>(
            `${apiBaseUrl}/commerce/shops/by-domain?domain=${encodeURIComponent(domain)}`,
            SHOP_IDENTITY_REVALIDATE
        );
        return json.data.shop;
    } catch {
        return null;
    }
}

export async function getTheme(apiBaseUrl: string, storeId: string): Promise<ThemeCustomization | null> {
    try {
        const json = await fetchJson<{ data: { theme: ThemeCustomization } }>(
            `${apiBaseUrl}/commerce/stores/${storeId}/theme/storefront`
        );
        return json.data.theme;
    } catch {
        return null;
    }
}

export async function getPagesByLocation(
    apiBaseUrl: string,
    storeId: string,
    location: "navigation" | "footer"
): Promise<Page[]> {
    try {
        const json = await fetchJson<{ data: { pages: Page[] } }>(
            `${apiBaseUrl}/commerce/${storeId}/pages/public?location=${location}`,
            PAGES_REVALIDATE
        );
        return json.data.pages ?? [];
    } catch {
        return [];
    }
}

export async function getNewInCollection(
    apiBaseUrl: string,
    storeId: string,
    limit = 4
): Promise<StorefrontProduct[]> {
    try {
        const json = await fetchJson<{ data: { data: StorefrontProduct[] } }>(
            `${apiBaseUrl}/commerce/${storeId}/new-in?limit=${limit}`
        );
        return json.data.data ?? [];
    } catch {
        return [];
    }
}

export async function getBestSellers(
    apiBaseUrl: string,
    storeId: string,
    limit = 4
): Promise<StorefrontProduct[]> {
    try {
        const json = await fetchJson<{ data: { data: StorefrontProduct[] } }>(
            `${apiBaseUrl}/commerce/${storeId}/best-seller?limit=${limit}`
        );
        return json.data.data ?? [];
    } catch {
        return [];
    }
}

export async function getCategories(
    apiBaseUrl: string,
    storeId: string,
    withProducts = false
): Promise<Category[]> {
    try {
        const json = await fetchJson<{ data: { data: Category[] } }>(
            `${apiBaseUrl}/commerce/${storeId}/categories?withProducts=${withProducts}`,
            CATEGORY_REVALIDATE
        );
        return json.data.data ?? [];
    } catch {
        return [];
    }
}

export interface ProductListParams {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: ProductSortBy;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ProductListResult {
    products: StorefrontProduct[];
    pagination: PaginationMeta | null;
}

export async function getAllProducts(
    apiBaseUrl: string,
    storeId: string,
    params: ProductListParams
): Promise<ProductListResult> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 12));

    try {
        const json = await fetchJson<{ data: { products: StorefrontProduct[]; pagination?: PaginationMeta } }>(
            `${apiBaseUrl}/commerce/${storeId}/storefront/products?${query.toString()}`
        );
        return { products: json.data.products ?? [], pagination: json.data.pagination ?? null };
    } catch {
        return { products: [], pagination: null };
    }
}

export interface ProductDetailsResult {
    product: (ProductDetail & { variants?: ProductVariant[]; variantOptions?: VariantOptions }) | null;
    variants: ProductVariant[];
    variantOptions: VariantOptions | null;
    relatedProducts: StorefrontProduct[];
}

export async function getProductDetails(
    apiBaseUrl: string,
    storeId: string,
    productId: string
): Promise<ProductDetailsResult> {
    try {
        const json = await fetchJson<{
            data: {
                data: {
                    product: ProductDetail & { variants?: ProductVariant[]; variantOptions?: VariantOptions };
                    relatedProducts?: StorefrontProduct[];
                };
            };
        }>(`${apiBaseUrl}/commerce/${storeId}/product/${productId}`, PRODUCT_DETAIL_REVALIDATE);

        const { product, relatedProducts } = json.data.data;
        return {
            product,
            variants: product?.variants ?? [],
            variantOptions: product?.variantOptions ?? null,
            relatedProducts: relatedProducts ?? [],
        };
    } catch {
        return { product: null, variants: [], variantOptions: null, relatedProducts: [] };
    }
}

export async function getPageBySlug(apiBaseUrl: string, storeId: string, slug: string): Promise<PageDetail | null> {
    try {
        const json = await fetchJson<{ data: { page: PageDetail } }>(
            `${apiBaseUrl}/commerce/${storeId}/pages/slug/${slug}`,
            PAGES_REVALIDATE
        );
        return json.data.page;
    } catch {
        return null;
    }
}
