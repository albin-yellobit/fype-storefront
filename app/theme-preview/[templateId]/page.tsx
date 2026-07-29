import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "@/lib/storefront-api";
import { getThemeTemplate } from "@/lib/preview-api";
import { resolveThemeSlug } from "@/lib/theme";
import ThemedHome from "@/components/themes/ThemedHome";
import { previewProducts, previewCategories, buildPreviewSections } from "@/components/themes/theme_one/previewData";
import type { ShopIdentity, ThemeCustomization } from "@/types/storefront";
import { DEMO_SHOP_NAMES } from "./demoData";

// A theme's fully static preset preview — no real shop, no real nav pages,
// no real catalog, nothing derived from whatever domain this happens to be
// viewed on. Matches Shopify's themes.shopify.com theme-store browsing
// experience: the same canned demo content regardless of who's looking.
export default async function ThemePresetPreviewPage({ params }: { params: Promise<{ templateId: string }> }) {
    const { templateId } = await params;
    const apiBaseUrl = await getApiBaseUrl();
    const template = await getThemeTemplate(apiBaseUrl, templateId);
    if (!template) notFound();

    const themeSlug = resolveThemeSlug(template.templateId);
    const demoShopName = DEMO_SHOP_NAMES[themeSlug] ?? template.name;

    const demoShop: ShopIdentity = {
        shopId: "demo",
        shopName: demoShopName,
        isActive: true,
    };

    const demoTheme: ThemeCustomization = {
        storeId: "demo",
        templateId: themeSlug,
        scrollingText: "Welcome to our store! Free shipping on orders over $50",
        enableScrollingText: true,
        navbar: { displayType: "title", title: demoShopName },
        footer: { displayType: "title", title: demoShopName, description: "" },
        footerText: "",
        sections: buildPreviewSections(template.availableSections),
        // No themeConfig on purpose — a theme with its own self-contained
        // HomePage (e.g. Spark) renders its bundled defaults untouched by
        // any real store's saved customization.
    };

    return (
        <ThemedHome
            themeSlug={themeSlug}
            shop={demoShop}
            theme={demoTheme}
            navPages={[]}
            footerPages={[]}
            newInProducts={previewProducts}
            bestSellerProducts={previewProducts}
            categories={previewCategories}
        />
    );
}

export async function generateMetadata({ params }: { params: Promise<{ templateId: string }> }): Promise<Metadata> {
    const { templateId } = await params;
    const apiBaseUrl = await getApiBaseUrl();
    const template = await getThemeTemplate(apiBaseUrl, templateId);
    return { title: template ? `${template.name} — Theme Preview` : "Theme Preview" };
}
