import Link from "next/link";
import type { ProductsPageProps } from "@/components/themes/registry";
import Header from "./Header";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { sparkDefaultConfig } from "./sparkConfig";

// Spark's self-contained Products (PLP) page. No Spark Footer yet (same
// deferral as HomePage.tsx — see MIGRATION_RUNBOOK.md), so this ends after
// the product grid rather than awkwardly borrowing theme_one's Footer,
// which expects theme_one's ThemeCustomization shape (navbar/footer/
// footerText) that these self-contained pages don't carry.
export default function ProductsPage({ shop, navPages, categories, products, pagination, searchParams }: ProductsPageProps) {
    const navItems = navPages
        .filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic")
        .map((p) => ({ label: p.title, href: `/${p.slug}` }));

    const globalTax = shop.settings?.tax;
    const page = searchParams.page ? Number(searchParams.page) : 1;

    const buildPageHref = (targetPage: number) => {
        const qs = new URLSearchParams();
        if (searchParams.category) qs.set("category", searchParams.category);
        if (searchParams.minPrice) qs.set("minPrice", searchParams.minPrice);
        if (searchParams.maxPrice) qs.set("maxPrice", searchParams.maxPrice);
        if (searchParams.sortBy) qs.set("sortBy", searchParams.sortBy);
        if (searchParams.search) qs.set("search", searchParams.search);
        qs.set("page", String(targetPage));
        return `/products?${qs.toString()}`;
    };

    return (
        <div className="bg-white text-black min-h-screen">
            <Header
                header={{ ...sparkDefaultConfig.sections.header.settings, logo_text: shop.shopName }}
                navItems={navItems}
                announcementBlocks={[]}
            />

            <div className="py-12 md:py-16 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Shop All</h1>
                        <p className="text-gray-500 mt-2">{pagination?.totalItems ?? products.length} products</p>
                    </div>
                    <ProductFilters />
                </div>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/products?category=${encodeURIComponent(category.slug)}`}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                    searchParams.category === category.slug
                                        ? "border-black bg-black text-white"
                                        : "border-gray-200 text-gray-700 hover:border-black"
                                }`}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}

                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {products.map((product) => (
                                <ProductCard key={product.productId} product={product} globalTax={globalTax} shopName={shop.shopName} storeId={shop.shopId} />
                            ))}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12">
                                {pagination.hasPrevPage && (
                                    <Link href={buildPageHref(page - 1)} className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:border-black transition-colors">
                                        Previous
                                    </Link>
                                )}
                                <span className="text-sm text-gray-500">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                {pagination.hasNextPage && (
                                    <Link href={buildPageHref(page + 1)} className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-200 mb-4 block">search_off</span>
                        <p className="text-gray-500 text-lg mb-2">No products found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
