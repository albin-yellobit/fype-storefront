import type { CollectionPageProps } from "@/components/themes/registry";
import SparkCollectionPage from "./SparkCollectionPage";
import { buildSparkNavItems, mergeSparkConfig, sparkDefaultConfig } from "./sparkConfig";

// Spark's self-contained single-Collection listing page — new with Collection
// List's real /collections/[slug] links (the reference has no equivalent
// page at all; its own onCollectionClick has no real destination).
//
// Thin Server shell — resolves the real themeConfig into a full SparkConfig
// and delegates all rendering + live-editing to SparkCollectionPage, a
// Client Component, same split ProductsPage.tsx/SparkShop.tsx already uses.
export default function CollectionPage({ shop, navPages, collection, products, themeConfig }: CollectionPageProps) {
    const config = mergeSparkConfig(sparkDefaultConfig, themeConfig);
    const navItems = buildSparkNavItems(navPages);

    const globalTax = shop.settings?.tax;

    return (
        <SparkCollectionPage
            initialConfig={config}
            shop={shop}
            navItems={navItems}
            collection={collection}
            products={products}
            globalTax={globalTax}
            storeId={shop.shopId}
        />
    );
}
