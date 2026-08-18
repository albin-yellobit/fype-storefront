import type { ProductsPageProps } from "@/components/themes/registry";
import SparkShop from "./SparkShop";
import { buildSparkNavItems, mergeSparkConfig, sparkDefaultConfig } from "./sparkConfig";

// Spark's self-contained Products (PLP) page.
//
// Thin Server shell — resolves the real themeConfig into a full SparkConfig
// and delegates all rendering + live-editing to SparkShop, a Client
// Component, same split HomePage.tsx/SparkHome.tsx already use.
// `categories` (part of ProductsPageProps) is intentionally not forwarded —
// Spark's category-pill filter row was removed for exact parity with the
// design reference's Shop.tsx, which has no category filter UI at all.
export default function ProductsPage({ shop, navPages, products, pagination, searchParams, themeConfig }: ProductsPageProps) {
    const config = mergeSparkConfig(sparkDefaultConfig, themeConfig);
    const navItems = buildSparkNavItems(navPages);

    return (
        <SparkShop
            initialConfig={config}
            shop={shop}
            navItems={navItems}
            products={products}
            pagination={pagination}
            searchParams={searchParams}
        />
    );
}
