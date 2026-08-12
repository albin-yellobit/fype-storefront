"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApi } from "@/lib/client-api";
import { useAppSelector } from "@/redux/hooks";
import ProductCard from "./ProductCard";
import type { StorefrontProduct } from "@/types/storefront";

interface WishlistViewProps {
    storeId?: string;
}

// Same real fetch-and-filter data flow as theme_one's WishlistView (no
// dedicated wishlist-products endpoint exists — filters the store's product
// list by the redux wishlist id array), restyled as a product grid reusing
// Spark's own ProductCard for visual consistency with the Products page.
export default function WishlistView({ storeId }: WishlistViewProps) {
    const { wishlist, wishlistLoading } = useAppSelector((state) => state.user);
    const [products, setProducts] = useState<StorefrontProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Matches theme_one's WishlistView: no reset here when the wishlist
        // is empty — `products` starts as [] and the empty-state check below
        // covers the common case of never having anything wishlisted.
        if (!storeId || wishlist.length === 0) return;

        let cancelled = false;
        // Flag loading before starting the async fetch — genuinely tied to
        // the network call that follows (same justification/pattern as
        // theme_one's WishlistView).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        getApi<{ data: { products: StorefrontProduct[] } }>(`/commerce/${storeId}/storefront/products?limit=100`)
            .then((res) => {
                if (cancelled) return;
                const all = res.data.data.products ?? [];
                setProducts(all.filter((p) => wishlist.includes(p.productId)));
            })
            .catch(() => {
                if (!cancelled) setProducts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [storeId, wishlist]);

    if (loading || wishlistLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto" />
                <p className="mt-4 text-gray-500">Loading your wishlist…</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">favorite</span>
                <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-6">Save items you love to pick them up later.</p>
                <Link href="/products" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-900 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {products.map((product) => (
                <ProductCard key={product.productId} product={product} storeId={storeId} showWishlistButton />
            ))}
        </div>
    );
}
