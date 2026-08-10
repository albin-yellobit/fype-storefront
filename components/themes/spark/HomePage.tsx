import type { HomePageProps } from "@/components/themes/registry";
import SparkHome from "./SparkHome";
import { mergeSparkConfig, sparkDefaultConfig } from "./sparkConfig";
import { getApiBaseUrl, getCollectionProducts, getProductDetails, getCollectionsByIds } from "@/lib/storefront-api";

// Spark's self-contained Home page — reads the store's real saved
// `themeConfig` (Theme.themeConfig, a Mixed field since Spark's shape
// doesn't fit theme_one's fixed ThemeSections columns) merged onto Spark's
// bundled defaults, so an un-customized store still renders sensible
// placeholder content.
//
// The actual rendering (and the live-editor postMessage draft override) is
// delegated to SparkHome, a Client Component — see MIGRATION_RUNBOOK.md
// Phase 4.5's customization-editor section for the full protocol.
//
// Header, Image Banner, Rich Text, Featured Collection, Featured Product,
// Multicolumn, Image with Text, Collection List, Slideshow, Collapsible
// Content, and Contact Form are wired so far. The remaining section types
// spark.config.json declares (email_signup) and a real Footer aren't ported
// yet.
export default async function HomePage({ shop, navPages, themeConfig }: HomePageProps) {
    // Real bug avoided here: the shop's name is only the *default seed* for
    // logo_text (so an un-customized store shows something sensible), not a
    // permanent override — it must be merged in BELOW themeConfig, otherwise
    // a merchant's explicit logo_text customization would never be visible.
    const shopSeededConfig = mergeSparkConfig(sparkDefaultConfig, {
        sections: { header: { settings: { logo_text: shop.shopName } } },
    });
    const config = mergeSparkConfig(shopSeededConfig, themeConfig);

    const navItems = navPages
        .filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic")
        .map((p) => ({ label: p.title, href: `/${p.slug}` }));

    // Fetched here (not in app/(storefront)/page.tsx alongside newIn/best-
    // sellers) because the collection to fetch is only known after resolving
    // Spark's own config — the generic page-level data loader has no notion
    // of per-theme section config.
    const featuredCollectionSettings = config.sections.featured_collection.settings;
    let initialFeaturedCollectionProducts: Awaited<ReturnType<typeof getCollectionProducts>> = [];
    const featuredProductSettings = config.sections.featured_product.settings;
    let initialFeaturedProduct: Awaited<ReturnType<typeof getProductDetails>>["product"] = null;
    const needsCollectionProducts = !config.sections.featured_collection.hidden && featuredCollectionSettings.collection_id;
    const needsFeaturedProduct = !config.sections.featured_product.hidden && featuredProductSettings.product_id;
    const collectionListSettings = config.sections.collection_list.settings;
    let initialCollectionListCollections: Awaited<ReturnType<typeof getCollectionsByIds>> = [];
    const needsCollectionList = !config.sections.collection_list.hidden && collectionListSettings.collection_ids.length > 0;

    if (needsCollectionProducts || needsFeaturedProduct || needsCollectionList) {
        const apiBaseUrl = await getApiBaseUrl();
        if (needsCollectionProducts) {
            initialFeaturedCollectionProducts = await getCollectionProducts(
                apiBaseUrl,
                shop.shopId,
                featuredCollectionSettings.collection_id,
                featuredCollectionSettings.products_to_show
            );
        }
        if (needsFeaturedProduct) {
            const result = await getProductDetails(apiBaseUrl, shop.shopId, featuredProductSettings.product_id);
            initialFeaturedProduct = result.product;
        }
        if (needsCollectionList) {
            initialCollectionListCollections = await getCollectionsByIds(apiBaseUrl, shop.shopId, collectionListSettings.collection_ids);
        }
    }

    return (
        <SparkHome
            initialConfig={config}
            navItems={navItems}
            shop={shop}
            initialFeaturedCollectionProducts={initialFeaturedCollectionProducts}
            initialFeaturedProduct={initialFeaturedProduct}
            initialCollectionListCollections={initialCollectionListCollections}
        />
    );
}
