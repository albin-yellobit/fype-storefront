import type { CollectionPageProps } from "@/components/themes/registry";
import Header from "./Header";
import ProductCard from "./ProductCard";
import { sparkDefaultConfig } from "./sparkConfig";

// Spark's self-contained single-Collection listing page — new with Collection
// List's real /collections/[slug] links (the reference has no equivalent
// page at all; its own onCollectionClick has no real destination). Same
// "no Spark Footer yet" deferral as ProductsPage.tsx/HomePage.tsx.
export default function CollectionPage({ shop, navPages, collection, products }: CollectionPageProps) {
    const navItems = navPages
        .filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic")
        .map((p) => ({ label: p.title, href: `/${p.slug}` }));

    const globalTax = shop.settings?.tax;

    return (
        <div className="bg-white text-black min-h-screen">
            <Header
                header={{ ...sparkDefaultConfig.sections.header.settings, logo_text: shop.shopName }}
                navItems={navItems}
                announcementBlocks={[]}
            />

            <div className="py-12 md:py-16 px-6 max-w-7xl mx-auto">
                <div className="mb-12 border-b border-gray-100 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{collection.name}</h1>
                    <p className="text-gray-500 mt-2">{products.length} products</p>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((product) => (
                            <ProductCard key={product.productId} product={product} globalTax={globalTax} shopName={shop.shopName} storeId={shop.shopId} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-2">No products in this collection yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
