import { notFound } from "next/navigation";
import { getApiBaseUrl } from "@/lib/storefront-api";
import { getThemeTemplate } from "@/lib/preview-api";
import { loadTheme, resolveThemeSlug } from "@/lib/theme";
import Providers from "@/components/shared/Providers";
import { DEMO_SHOP_NAMES } from "./demoData";

// Store-independent theme preset preview — mirrors Shopify's
// themes.shopify.com/themes/<theme>/presets/<preset> browsing experience:
// keyed only by templateId, no domain/tenant resolution at all. Deliberately
// its own route (outside the (storefront) group) rather than reusing
// app/(storefront)/layout.tsx, which always resolves a shop by host domain —
// this route must render identically no matter what host it's viewed from.
export default async function ThemePreviewLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ templateId: string }>;
}) {
    const { templateId } = await params;
    const apiBaseUrl = await getApiBaseUrl();
    const template = await getThemeTemplate(apiBaseUrl, templateId);
    if (!template) notFound();

    const themeSlug = resolveThemeSlug(template.templateId);
    const themeModule = await loadTheme(themeSlug);
    const ThemeLayout = themeModule.Layout;
    const demoShopName = DEMO_SHOP_NAMES[themeSlug] ?? template.name;

    return (
        // No storeId passed to Providers — this is a static demo, not a real
        // store, so there's no cart/profile to bootstrap (see
        // components/shared/Providers.tsx's AuthBootstrap, which only runs
        // when storeId is set).
        <Providers>
            <ThemeLayout shopName={demoShopName}>{children}</ThemeLayout>
        </Providers>
    );
}
