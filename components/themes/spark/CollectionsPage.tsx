import type { CollectionsPageProps } from "@/components/themes/registry";
import SparkCollections from "./SparkCollections";
import { mergeSparkConfig, sparkDefaultConfig } from "./sparkConfig";

// Spark's self-contained Collections (list-all) page — full port of
// Fype-E-Commerce-UI's spark/Collections.tsx (read-only design reference).
// Same "no Spark Footer yet" deferral as ProductsPage.tsx/CollectionPage.tsx.
//
// Thin Server shell — resolves the real themeConfig into a full SparkConfig
// and delegates all rendering + live-editing to SparkCollections, a Client
// Component, same split HomePage.tsx/SparkHome.tsx (and now
// ProductsPage.tsx/SparkShop.tsx) already use.
export default function CollectionsPage({ shop, navPages, collections, themeConfig }: CollectionsPageProps) {
    const config = mergeSparkConfig(sparkDefaultConfig, themeConfig);
    const navItems = navPages
        .filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic")
        .map((p) => ({ label: p.title, href: `/${p.slug}` }));

    return <SparkCollections initialConfig={config} shop={shop} navItems={navItems} collections={collections} />;
}
