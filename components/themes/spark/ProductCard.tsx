import Link from "next/link";
import WishlistButton from "@/components/themes/theme_one/WishlistButton";
import { calculateProductTax } from "@/utils/taxCalculator";
import type { StorefrontProduct, TaxSettings } from "@/types/storefront";

const DEFAULT_PRODUCT_IMAGE =
    "https://i0.wp.com/mikeyarce.com/wp-content/uploads/2021/09/woocommerce-placeholder.png?ssl=1";

interface SparkProductCardProps {
    product: StorefrontProduct;
    globalTax?: TaxSettings;
    shopName?: string;
    storeId?: string;
}

// WishlistButton is reused as-is from theme_one — it's already
// theme-agnostic (just productId/storeId/shopName + its own redux wiring),
// no reason to reimplement the same wishlist logic + AuthModal handoff here.
export default function ProductCard({ product, globalTax, shopName, storeId }: SparkProductCardProps) {
    const productImage = product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE;
    const price = Number(product.price) || 0;
    const maxPrice = Number(product.maxPrice) || 0;
    const compareAtPrice = Number(product.compareAtPrice) || 0;

    const { displayPrice } = calculateProductTax(price, globalTax, { applied: product.taxApplied, rate: product.taxRate });
    const { displayPrice: maxDisplayPrice } = calculateProductTax(maxPrice, globalTax, { applied: product.taxApplied, rate: product.taxRate });
    const { displayPrice: compareDisplayPrice } = calculateProductTax(compareAtPrice, globalTax, {
        applied: product.taxApplied,
        rate: product.taxRate,
    });

    return (
        <div className="group relative">
            <WishlistButton productId={product.productId} storeId={storeId} shopName={shopName} />

            <Link href={`/products/${product.productId}`} className="block">
                <div className="aspect-square bg-gray-50 border border-gray-100 rounded-xl overflow-hidden mb-5 relative isolate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {product.hasDiscount && (
                        <span className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm z-10 tracking-wider">
                            {product.discountPercentage}% off
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-500 transition-colors truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        {product.hasDiscount && <p className="text-gray-400 text-sm line-through">₹{compareDisplayPrice}</p>}
                        <p className="text-gray-500">
                            {product.hasVariants && price !== maxPrice ? `₹${displayPrice} – ₹${maxDisplayPrice}` : `₹${displayPrice}`}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
