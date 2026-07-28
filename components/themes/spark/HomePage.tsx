import type { HomePageProps } from "@/components/themes/registry";
import SparkHome from "./SparkHome";
import { mergeSparkConfig, sparkDefaultConfig } from "./sparkConfig";

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
// Deliberately minimal for this first slice: only Header + the hero banner
// are wired. The other section types spark.config.json declares (rich_text,
// featured_collection, featured_product, multicolumn, collection_list,
// slideshow, collapsible_content, contact_form, email_signup) and a real
// Footer aren't ported yet.
export default function HomePage({ shop, navPages, themeConfig }: HomePageProps) {
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

    return <SparkHome initialConfig={config} navItems={navItems} />;
}
