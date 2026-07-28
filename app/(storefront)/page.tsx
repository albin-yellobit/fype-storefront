import type { Metadata } from "next";
import { headers } from "next/headers";
import {
    getApiBaseUrl,
    getShopByDomain,
    getTheme,
    getPagesByLocation,
    getNewInCollection,
    getBestSellers,
    getCategories,
} from "@/lib/storefront-api";
import { getThemeTemplate } from "@/lib/preview-api";
import { loadTheme, resolveThemeSlug } from "@/lib/theme";
import ShopNotFound from "@/components/shared/ShopNotFound";
import type { GridProduct } from "@/components/themes/theme_one/ProductGrid";
import { previewProducts, previewCategories, buildPreviewSections } from "@/components/themes/theme_one/previewData";
import type { StorefrontProduct, ThemeSections, ThemeCustomization } from "@/types/storefront";

async function getHomeData() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const domain = host.split(":")[0];
    const previewTemplateId = headersList.get("x-preview-template-id");

    const apiBaseUrl = await getApiBaseUrl();
    const shop = await getShopByDomain(apiBaseUrl, domain);
    if (!shop) return null;

    const [navPages, footerPages] = await Promise.all([
        getPagesByLocation(apiBaseUrl, shop.shopId, "navigation"),
        getPagesByLocation(apiBaseUrl, shop.shopId, "footer"),
    ]);

    // Catalog-browse theme preview (Phase 4): dummy content only, no real
    // catalog fetched at all. Falls through to normal real-data rendering
    // below if the template doesn't exist/isn't active — the backend already
    // 404s for inactive templates, so a null return here just means "not a
    // valid preview target," not an error state.
    if (previewTemplateId) {
        const template = await getThemeTemplate(apiBaseUrl, previewTemplateId);
        if (template) {
            const previewTheme: ThemeCustomization = {
                storeId: shop.shopId,
                scrollingText: "Welcome to our store! Free shipping on orders over $50",
                enableScrollingText: true,
                navbar: { displayType: "title", title: shop.shopName },
                footer: { displayType: "title", title: shop.shopName, description: "" },
                footerText: "",
                sections: buildPreviewSections(template.availableSections),
            };

            return {
                shop,
                theme: previewTheme,
                navPages,
                footerPages,
                newInProducts: previewProducts,
                bestSellerProducts: previewProducts,
                categories: previewCategories,
            };
        }
    }

    const [theme, newInProducts, bestSellerProducts, categories] = await Promise.all([
        getTheme(apiBaseUrl, shop.shopId),
        getNewInCollection(apiBaseUrl, shop.shopId, 4),
        getBestSellers(apiBaseUrl, shop.shopId, 4),
        getCategories(apiBaseUrl, shop.shopId, false),
    ]);

    return { shop, theme, navPages, footerPages, newInProducts, bestSellerProducts, categories };
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getHomeData();
    const storeName = data?.theme?.navbar?.title || data?.theme?.footer?.title || data?.shop?.shopName || "Store";
    return { title: storeName };
}

function formatProductsForGrid(products: StorefrontProduct[]): GridProduct[] {
    return products.map((product) => ({
        id: product.productId,
        productId: product.productId,
        name: product.name,
        price: product.price,
        maxPrice: product.maxPrice,
        compareAtPrice: product.compareAtPrice,
        hasVariants: product.hasVariants,
        taxApplied: product.taxApplied,
        taxRate: product.taxRate,
        hasDiscount: product.hasDiscount,
        discountPercentage: product.discountPercentage,
        imageUrl:
            product.image ||
            product.images?.[0] ||
            "https://i0.wp.com/mikeyarce.com/wp-content/uploads/2021/09/woocommerce-placeholder.png?ssl=1",
    }));
}

export default async function HomePage() {
    const data = await getHomeData();

    if (!data || !data.theme) {
        return <ShopNotFound />;
    }

    const { shop, theme, navPages, footerPages, newInProducts, bestSellerProducts, categories } = data;

    const themeSlug = resolveThemeSlug(shop.themeId);
    const themeModule = await loadTheme(themeSlug);
    const { Header, Footer, Hero, ProductGrid, Collections } = themeModule;

    const baseNavItems = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
    ];
    const navigationPages = navPages.filter(
        (page) => page.isActive && page.status === "visible" && page.pageType === "generic"
    );
    const navItems = [...baseNavItems, ...navigationPages.map((page) => ({ label: page.title, href: `/${page.slug}` }))];

    const sections = theme.sections;
    const isSectionEnabled = (sectionName: keyof ThemeSections) => sections[sectionName]?.enabled ?? true;
    const sortedSections = Object.entries(sections).sort(([, a], [, b]) => (a?.order || 0) - (b?.order || 0));

    const formattedCollections = categories.map((category) => ({
        id: category.slug,
        name: category.name,
        imageUrl: category.banner?.imageUrl,
    }));

    const globalTax = shop.settings?.tax;

    return (
        <div className="bg-white font-display text-black">
            <Header
                variant="default"
                scrollingText={theme.enableScrollingText ? theme.scrollingText : undefined}
                scorllEnabled={theme.enableScrollingText}
                shopName={shop.shopName}
                navbar={theme.navbar}
                footer={theme.footer}
                navItems={navItems}
                storeId={shop.shopId}
            />

            <main className="grow" style={{ paddingTop: theme.enableScrollingText ? "40px" : "0px" }}>
                {sortedSections.map(([key, section]) => {
                    if (!section?.enabled) return null;

                    switch (key) {
                        case "heroBanner":
                            return <Hero key={key} slides={section.images} />;

                        case "newInStore":
                            return newInProducts.length > 0 ? (
                                <ProductGrid
                                    key={key}
                                    products={formatProductsForGrid(newInProducts)}
                                    title={section.title}
                                    globalTax={globalTax}
                                />
                            ) : null;

                        case "categories":
                            return formattedCollections.length > 0 ? (
                                <Collections key={key} collections={formattedCollections} />
                            ) : null;

                        case "bestSellers":
                            return bestSellerProducts.length > 0 ? (
                                <ProductGrid
                                    key={key}
                                    products={formatProductsForGrid(bestSellerProducts)}
                                    title={section.title}
                                    globalTax={globalTax}
                                />
                            ) : null;

                        case "footerSection":
                            return null;

                        default:
                            return null;
                    }
                })}
            </main>

            {isSectionEnabled("footerSection") && (
                <Footer
                    footer={theme.footer}
                    navbar={theme.navbar}
                    footerText={theme.footerText}
                    shopName={shop.shopName}
                    footerPages={footerPages}
                />
            )}
        </div>
    );
}
