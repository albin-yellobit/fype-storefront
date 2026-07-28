import type { Metadata } from "next";
import { headers } from "next/headers";
import {
    getApiBaseUrl,
    getShopByDomain,
    getTheme,
    getPagesByLocation,
    getProductDetails,
} from "@/lib/storefront-api";
import { loadTheme, resolveThemeSlug } from "@/lib/theme";
import ShopNotFound from "@/components/shared/ShopNotFound";

interface ProductDetailsPageProps {
    params: Promise<{ productId: string }>;
}

async function getSharedShopData() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const domain = host.split(":")[0];

    const apiBaseUrl = await getApiBaseUrl();
    const shop = await getShopByDomain(apiBaseUrl, domain);
    if (!shop) return null;

    const [theme, navPages, footerPages] = await Promise.all([
        getTheme(apiBaseUrl, shop.shopId),
        getPagesByLocation(apiBaseUrl, shop.shopId, "navigation"),
        getPagesByLocation(apiBaseUrl, shop.shopId, "footer"),
    ]);

    return { apiBaseUrl, shop, theme, navPages, footerPages };
}

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
    const { productId } = await params;
    const data = await getSharedShopData();
    const storeName = data?.theme?.navbar?.title || data?.theme?.footer?.title || data?.shop?.shopName || "Store";
    if (!data) return { title: storeName };

    const { product } = await getProductDetails(data.apiBaseUrl, data.shop.shopId, productId);
    return { title: product ? `${product.name} - ${storeName}` : `Product Details - ${storeName}` };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const { productId } = await params;
    const data = await getSharedShopData();

    if (!data || !data.theme) return <ShopNotFound />;

    const { apiBaseUrl, shop, theme, navPages, footerPages } = data;
    const { product, variants, variantOptions, relatedProducts } = await getProductDetails(apiBaseUrl, shop.shopId, productId);

    const themeSlug = resolveThemeSlug(shop.themeId);
    const themeModule = await loadTheme(themeSlug);
    const { Header, Footer, ProductDetailsView } = themeModule;

    const baseNavItems = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/products" },
    ];
    const navigationPages = navPages.filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic");
    const navItems = [...baseNavItems, ...navigationPages.map((p) => ({ label: p.title, href: `/${p.slug}` }))];

    return (
        <div>
            <Header variant="default" shopName={shop.shopName} navbar={theme.navbar} footer={theme.footer} navItems={navItems} storeId={shop.shopId} />

            {product ? (
                <ProductDetailsView
                    product={product}
                    variants={variants}
                    variantOptions={variantOptions}
                    relatedProducts={relatedProducts}
                    globalTax={shop.settings?.tax}
                    shopName={shop.shopName}
                    storeId={shop.shopId}
                />
            ) : (
                <div className="flex justify-center items-center min-h-screen text-black/60">Product not found</div>
            )}

            <Footer footer={theme.footer} navbar={theme.navbar} footerText={theme.footerText} shopName={shop.shopName} footerPages={footerPages} />
        </div>
    );
}
