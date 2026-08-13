"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProductDetailsPageProps } from "@/components/themes/registry";
import Header from "./Header";
import Footer from "./sections/Footer";
import ProductGallery from "./ProductGallery";
import { mergeSparkConfig, sparkDefaultConfig, type SparkConfigOverride } from "./sparkConfig";
import { SPARK_DRAFT_READY, SPARK_DRAFT_UPDATE, SPARK_SECTION_CLICKED, SPARK_SET_ACTIVE_SECTION } from "./SparkHome";
import AuthModal from "@/components/shared/AuthModal";
import { calculateProductTax } from "@/utils/taxCalculator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart, addToGuestCart, addToWishlist, fetchCart, fetchGuestCart, removeFromWishlist } from "@/redux/slices/userSlice";

// Same real data/redux contract as theme_one's ProductDetailsView (variant
// resolution, guest-vs-authenticated cart dispatch, wishlist toggle) —
// restyled to match the Spark design reference (generic option buttons
// standing in for its hardcoded "size" selector, quantity stepper, gallery
// with thumbnails).
//
// Unlike Shop/Collections/Collection Page, no separate Server/Client split
// wrapper exists here — this component was already "use client" (variant
// selection, cart dispatch), so the live-editing postMessage listener is
// embedded directly instead of adding a redundant wrapper layer.
export default function ProductDetailsPage({ shop, navPages, product, variants, variantOptions, relatedProducts, themeConfig }: ProductDetailsPageProps) {
    const dispatch = useAppDispatch();
    const { isAuthenticated, wishlist } = useAppSelector((state) => state.user);

    const [liveConfig, setLiveConfig] = useState(() => mergeSparkConfig(sparkDefaultConfig, themeConfig));
    const [isEditorPreview, setIsEditorPreview] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [hoveringLayout, setHoveringLayout] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || window.parent === window) return;
        if (new URLSearchParams(window.location.search).get("editorPreview") !== "1") return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsEditorPreview(true);

        function handleMessage(event: MessageEvent) {
            if (event.source !== window.parent || !event.data) return;
            if (event.data.type === SPARK_DRAFT_UPDATE) {
                setLiveConfig((current) => mergeSparkConfig(current, event.data.config as SparkConfigOverride));
            } else if (event.data.type === SPARK_SET_ACTIVE_SECTION) {
                setIsSelected(event.data.section === "page_settings:product");
            }
        }

        window.addEventListener("message", handleMessage);
        window.parent.postMessage({ type: SPARK_DRAFT_READY, config: liveConfig }, "*");
        return () => window.removeEventListener("message", handleMessage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const settings = liveConfig.page_settings.product;
    // Header/Footer are global across every Spark page, not Home-only — see
    // SparkShop.tsx's identical comment for the full rationale.
    const { header, announcement_bar: announcementBar, footer } = liveConfig.sections;
    const { logo: logoSettings, social_media: socialMedia } = liveConfig.theme_settings;
    const visibleAnnouncementBlocks = announcementBar.settings.show ? announcementBar.settings.blocks.filter((b) => !b.hidden) : [];

    const selectLayout = () => {
        window.parent.postMessage({ type: SPARK_SECTION_CLICKED, section: "page_settings:product" }, "*");
    };

    const isWishlisted = !!product && wishlist.includes(product.productId);
    const hasVariants = product?.hasVariants ?? false;
    const options = variantOptions?.options ?? [];
    const globalTax = shop.settings?.tax;

    // All hooks must run unconditionally (before the `!product` early return
    // below) — guarded internally with optional chaining instead.
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        if (hasVariants) {
            options.forEach((opt) => {
                if (opt.values.length > 0) init[opt.name] = opt.values[0];
            });
        }
        return init;
    });
    const [quantity, setQuantity] = useState(1);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [cartMessage, setCartMessage] = useState<string | null>(null);

    const selectedVariant = useMemo(() => {
        if (!hasVariants || variants.length === 0 || Object.keys(selectedOptions).length === 0) return null;

        let v = variants.find((variant) => Object.entries(selectedOptions).every(([k, val]) => variant.options[k] === val));
        if (!v) {
            const optionNames = Object.keys(selectedOptions);
            if (optionNames.length === 1 && options.length === 1) {
                const idx = options[0].values.indexOf(selectedOptions[optionNames[0]]);
                if (idx >= 0 && idx < variants.length) v = variants[idx];
            }
        }
        return v ?? null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOptions, variants, hasVariants]);

    const displayData = useMemo(() => {
        if (!product) return { price: 0, compareAtPrice: 0, taxApplied: false, taxRate: undefined, images: [] as string[], available: false };

        const continueSelling = product.inventory?.continueSelling ?? product.continueSellWhenOutOfStock ?? false;
        if (hasVariants && selectedVariant) {
            const variantImages = selectedVariant.image?.filter((img) => img && img.trim() !== "") ?? [];
            return {
                price: selectedVariant.price,
                compareAtPrice: selectedVariant.compareAtPrice,
                taxApplied: product.price.taxApplied,
                taxRate: product.price.taxRate,
                images: variantImages.length > 0 ? variantImages : product.images ?? [],
                available: (selectedVariant.inventory?.available ?? 0) > 0 || continueSelling,
            };
        }
        return {
            price: product.price.price,
            compareAtPrice: product.price.compareAtPrice,
            taxApplied: product.price.taxApplied,
            taxRate: product.price.taxRate,
            images: product.images ?? [],
            available: (product.inventory?.available ?? 0) > 0 || continueSelling,
        };
    }, [hasVariants, selectedVariant, product]);

    const [prevVariant, setPrevVariant] = useState(selectedVariant);
    if (selectedVariant !== prevVariant) {
        setPrevVariant(selectedVariant);
        setCartMessage(null);
    }

    const navItems = navPages
        .filter((p) => p.isActive && p.status === "visible" && p.pageType === "generic")
        .map((p) => ({ label: p.title, href: `/${p.slug}` }));
    // Same fallback as SparkHome.tsx: an un-configured store (no real
    // navigation Pages yet) still shows a populated nav bar, using the
    // theme's own default label list rather than an empty menu.
    const navigation = navItems.length > 0 ? navItems : header.settings.navigation.map((label) => ({ label, href: "/products" }));

    if (!product) {
        return (
            <div className="bg-white text-black min-h-screen">
                {!header.hidden && (
                    <Header
                        header={{ ...header.settings, logo_text: shop.shopName }}
                        navItems={navigation}
                        announcementBlocks={visibleAnnouncementBlocks}
                        logoUrl={logoSettings.logo_url}
                        logoWidth={logoSettings.logo_width}
                    />
                )}
                <div className="flex justify-center items-center min-h-[50vh] text-black/60">Product not found</div>
                {!footer.hidden && (
                    <Footer
                        settings={footer.settings}
                        blocks={footer.blocks.filter((b) => !b.hidden)}
                        socialMedia={socialMedia}
                        footerLogoUrl={logoSettings.footer_logo_url}
                        footerLogoWidth={logoSettings.footer_logo_width}
                    />
                )}
            </div>
        );
    }

    const handleOptionChange = (name: string, value: string) => setSelectedOptions((prev) => ({ ...prev, [name]: value }));

    const handleWishlistToggle = () => {
        // Real cart/wishlist mutations must never fire while the editor
        // iframe is open, matching the same disableQuickAdd/disableAddToCart
        // convention every other product-card call site already uses — the
        // button stays visible (not hidden), just inert.
        if (isEditorPreview) return;
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            return;
        }
        if (isWishlisted) dispatch(removeFromWishlist({ storeId: shop.shopId, productId: product.productId }));
        else dispatch(addToWishlist({ storeId: shop.shopId, productId: product.productId }));
    };

    const handleAddToCart = async () => {
        if (!displayData.available || isEditorPreview) return;
        const variantId = hasVariants && selectedVariant ? selectedVariant.variantId : undefined;

        if (isAuthenticated) {
            await dispatch(addToCart({ storeId: shop.shopId, productId: product.productId, variantId, quantity }));
            dispatch(fetchCart({ storeId: shop.shopId }));
        } else {
            await dispatch(addToGuestCart({ storeId: shop.shopId, productId: product.productId, variantId, quantity }));
            dispatch(fetchGuestCart({ storeId: shop.shopId }));
        }
        setCartMessage("Added to cart");
    };

    const { displayPrice } = calculateProductTax(displayData.price, globalTax, { applied: displayData.taxApplied, rate: displayData.taxRate });
    const { displayPrice: compareDisplayPrice } = calculateProductTax(displayData.compareAtPrice, globalTax, {
        applied: displayData.taxApplied,
        rate: displayData.taxRate,
    });

    const hasDescription = Boolean(product.description && product.description.replace(/<[^>]*>/g, "").trim());
    const showDescriptionBelowTitle = settings.show_description && hasDescription && settings.description_position === "Below Product Title";
    const showDescriptionBelowCart = settings.show_description && hasDescription && settings.description_position !== "Below Product Title";

    return (
        <div className="bg-white text-black min-h-screen pb-20">
            {!header.hidden && (
                <Header
                    header={{ ...header.settings, logo_text: shop.shopName }}
                    navItems={navigation}
                    announcementBlocks={visibleAnnouncementBlocks}
                    logoUrl={logoSettings.logo_url}
                    logoWidth={logoSettings.logo_width}
                />
            )}

            <div
                className="relative"
                onClick={isEditorPreview ? selectLayout : undefined}
                onMouseOver={isEditorPreview ? () => setHoveringLayout(true) : undefined}
                onMouseLeave={isEditorPreview ? () => setHoveringLayout(false) : undefined}
            >
                {isEditorPreview && (isSelected || hoveringLayout) && (
                    <div className="absolute inset-0 pointer-events-none z-60 border-2 border-blue-500 transition-colors">
                        {isSelected && (
                            <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 z-65">
                                <span className="material-symbols-outlined text-xs">widgets</span> Product Page Layout
                            </div>
                        )}
                        {hoveringLayout && (
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] flex flex-col items-center justify-center transition-opacity">
                                <div className="bg-white px-6 py-4 rounded-xl shadow-xl border border-gray-100 flex flex-col items-center pointer-events-auto">
                                    <span className="material-symbols-outlined text-2xl text-gray-400 mb-2">widgets</span>
                                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">Product Page Layout</h3>
                                    <p className="text-sm text-gray-500 text-center max-w-xs mt-1">Click to edit Product Page layout settings.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {settings.show_breadcrumb && (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center text-sm text-gray-500">
                    <Link href="/products" className="hover:text-black transition-colors">
                        Shop
                    </Link>
                    <span className="material-symbols-outlined text-base mx-2">chevron_right</span>
                    <span className="text-black">{product.name}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col md:flex-row gap-8 md:gap-16">
                <ProductGallery images={displayData.images} productName={product.name} imageLayout={settings.image_layout} />

                <div className="w-full md:w-1/2 flex flex-col pt-4">
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{product.name}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl text-gray-700 font-medium">₹{displayPrice}</span>
                                {displayData.compareAtPrice > displayData.price && (
                                    <span className="text-lg text-gray-400 line-through">₹{compareDisplayPrice}</span>
                                )}
                            </div>
                            {product.display?.vendor && <p className="text-xs text-gray-500 mt-2">Vendor: {product.display.vendor}</p>}

                            {showDescriptionBelowTitle && (
                                <div className="prose prose-sm text-gray-500 mt-6">
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleWishlistToggle}
                            disabled={isEditorPreview}
                            className="shrink-0 p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <span
                                className="material-symbols-outlined text-xl"
                                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0", color: isWishlisted ? "#e53e3e" : undefined }}
                            >
                                favorite
                            </span>
                        </button>
                    </div>

                    {settings.custom_link_label && settings.custom_link_url && (
                        <div className="flex justify-end mb-4">
                            <Link
                                href={settings.custom_link_url}
                                className="text-sm text-gray-500 underline underline-offset-4 hover:text-black transition-colors"
                            >
                                {settings.custom_link_label}
                            </Link>
                        </div>
                    )}

                    <div className="space-y-8 mb-10">
                        {hasVariants && options.length > 0 && (
                            <div className="space-y-6">
                                {options.map((option) => (
                                    <div key={option.name}>
                                        <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 block mb-3">
                                            {option.name}: <span className="font-normal normal-case">{selectedOptions[option.name]}</span>
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {option.values.map((value) => (
                                                <button
                                                    key={value}
                                                    onClick={() => handleOptionChange(option.name, value)}
                                                    className={`h-12 px-4 min-w-[3rem] border flex items-center justify-center text-sm transition-all rounded ${
                                                        selectedOptions[option.name] === value
                                                            ? "border-black bg-black text-white font-medium"
                                                            : "border-gray-200 text-gray-700 hover:border-black"
                                                    }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 block mb-3">Quantity</span>
                            <div className="flex items-center border border-gray-200 rounded w-32 h-12">
                                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors h-full text-gray-500">
                                    <span className="material-symbols-outlined text-base">remove</span>
                                </button>
                                <div className="flex-1 flex items-center justify-center font-medium h-full border-x border-gray-200">{quantity}</div>
                                <button onClick={() => setQuantity((q) => q + 1)} className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors h-full text-gray-500">
                                    <span className="material-symbols-outlined text-base">add</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {!displayData.available && <p className="text-xs font-semibold text-red-500 mb-4">Out of stock</p>}

                    <button
                        onClick={handleAddToCart}
                        disabled={!displayData.available || isEditorPreview}
                        className={`w-full py-4 rounded-xl font-medium tracking-wide transition-colors shadow-lg active:scale-[0.98] mb-4 disabled:opacity-60 disabled:cursor-not-allowed ${
                            displayData.available ? "bg-black text-white hover:bg-gray-900" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {displayData.available ? "Add to Cart" : "Out of Stock"}
                    </button>
                    {cartMessage && <p className="text-sm text-gray-500 mb-6">{cartMessage}</p>}

                    {showDescriptionBelowCart && (
                        <div className="prose prose-sm text-gray-500 mb-10 border-t border-gray-100 pt-8">
                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                    )}

                    {product.display?.tags && product.display.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {product.display.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mt-8">
                    <h2 className="text-xl font-bold mb-6">You might also like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.slice(0, 4).map((related) => (
                            <Link href={`/products/${related.productId}`} key={related.productId} className="group block">
                                <div className="aspect-square bg-gray-50 border border-gray-100 rounded-xl overflow-hidden mb-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={related.images?.[0] || related.image || "/placeholder-product.png"}
                                        alt={related.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate">{related.name}</p>
                                <p className="text-sm text-gray-500 mt-1">₹{related.price}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            </div>

            {!footer.hidden && (
                <Footer
                    settings={footer.settings}
                    blocks={footer.blocks.filter((b) => !b.hidden)}
                    socialMedia={socialMedia}
                    footerLogoUrl={logoSettings.footer_logo_url}
                    footerLogoWidth={logoSettings.footer_logo_width}
                />
            )}

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} storeId={shop.shopId} shopName={shop.shopName} platformName="Fype" />
        </div>
    );
}
