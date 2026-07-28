import type { Category, StorefrontProduct, ThemeSections } from "@/types/storefront";

// Bundled placeholder content for this theme's catalog-browse preview mode
// (Phase 4) — hardcoded Unsplash images + made-up products, mirroring
// Fype-E-Commerce-UI/src/themes/spark/SparkTheme.tsx's pattern (read-only
// reference). Never real store data, never persisted, never fetched from a
// live catalog — this is what a merchant sees before they've bought/applied
// this theme at all.

export const previewHeroImages: string[] = [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
];

export const previewProducts: StorefrontProduct[] = [
    {
        productId: "preview-1",
        name: "Classic Cotton Tee",
        slug: "classic-cotton-tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
        price: 799,
        compareAtPrice: 999,
        hasDiscount: true,
        discountPercentage: 20,
        hasVariants: true,
    },
    {
        productId: "preview-2",
        name: "Everyday Denim Jacket",
        slug: "everyday-denim-jacket",
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80"],
        price: 2499,
        compareAtPrice: 2499,
        hasDiscount: false,
        discountPercentage: 0,
        hasVariants: true,
    },
    {
        productId: "preview-3",
        name: "Minimalist Leather Wallet",
        slug: "minimalist-leather-wallet",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"],
        price: 1299,
        compareAtPrice: 1599,
        hasDiscount: true,
        discountPercentage: 19,
        hasVariants: false,
    },
    {
        productId: "preview-4",
        name: "Canvas Weekender Bag",
        slug: "canvas-weekender-bag",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
        price: 3499,
        compareAtPrice: 3499,
        hasDiscount: false,
        discountPercentage: 0,
        hasVariants: false,
    },
];

export const previewCategories: Category[] = [
    {
        _id: "preview-cat-1",
        name: "Apparel",
        slug: "apparel",
        banner: { imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", title: "Apparel", displayTitle: true },
        productCount: 12,
    },
    {
        _id: "preview-cat-2",
        name: "Accessories",
        slug: "accessories",
        banner: { imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80", title: "Accessories", displayTitle: true },
        productCount: 8,
    },
    {
        _id: "preview-cat-3",
        name: "Bags",
        slug: "bags",
        banner: { imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80", title: "Bags", displayTitle: true },
        productCount: 5,
    },
];

const SECTION_TITLES: Record<string, string> = {
    heroBanner: "Hero Banner",
    newInStore: "New In Store",
    categories: "Shop by Category",
    bestSellers: "Best Sellers",
    reviews: "What Our Customers Say",
    footerSection: "Footer",
};

// theme_one's Home page only understands these six section keys (see
// app/(storefront)/page.tsx's switch statement) — a template's
// `availableSections` may list others (newsletter, instagram, blog, ...)
// that this theme doesn't render at all yet, so they're ignored here.
const RENDERABLE_ORDER = ["heroBanner", "newInStore", "categories", "bestSellers", "reviews", "footerSection"] as const;

export function buildPreviewSections(availableSections: Record<string, boolean> | undefined): ThemeSections {
    const sections: ThemeSections = {};

    RENDERABLE_ORDER.forEach((key, index) => {
        const enabled = availableSections?.[key] ?? true;
        sections[key as keyof ThemeSections] = {
            id: key,
            title: SECTION_TITLES[key],
            enabled,
            order: index,
            ...(key === "heroBanner" ? { images: previewHeroImages } : {}),
        };
    });

    return sections;
}
