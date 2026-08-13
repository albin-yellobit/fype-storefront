"use client";

import { useEffect, useState } from "react";

interface SparkProductGalleryProps {
    images: string[];
    productName: string;
    // Product Detail page setting — three variants ported from the
    // reference's ProductPage.tsx:94-213. Unlike the reference, the
    // thumbnail strip here (both orientations) is a plain scrollable list,
    // not its ResizeObserver-driven "+N" overflow indicator — that's a
    // polish detail on top of the core 3-layout feature being ported, and
    // this component's thumbnail-below mode already shipped as a simple
    // scrollable strip before image_layout existed; kept consistent rather
    // than adding real/refs/observer complexity for a cosmetic difference.
    imageLayout?: "Main + Thumbnails Below" | "Main + Thumbnails Side" | "Single Image";
}

const FALLBACK_IMAGE = "/placeholder-product.png";

export default function ProductGallery({ images, productName, imageLayout = "Main + Thumbnails Below" }: SparkProductGalleryProps) {
    const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
    const [current, setCurrent] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Reset to the first image when the image set changes (e.g. switching
    // variants) rather than keeping a now out-of-range index.
    const [prevGallery, setPrevGallery] = useState(gallery);
    if (gallery !== prevGallery && gallery.join("|") !== prevGallery.join("|")) {
        setPrevGallery(gallery);
        setCurrent(0);
    }

    useEffect(() => {
        if (!isLightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsLightboxOpen(false);
            if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % gallery.length);
            if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + gallery.length) % gallery.length);
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [isLightboxOpen, gallery.length]);

    const isSideLayout = imageLayout === "Main + Thumbnails Side";
    const showThumbnails = imageLayout !== "Single Image" && gallery.length > 1;

    const mainImage = (
        <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="aspect-square bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden relative isolate block w-full"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[current]} alt={productName} className="w-full h-full object-cover" />
        </button>
    );

    const thumbnails = showThumbnails && (
        <div
            className={
                isSideLayout
                    ? "w-20 shrink-0 flex flex-col gap-3 overflow-y-auto max-h-150 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    : "flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            }
        >
            {gallery.map((img, idx) => (
                <button
                    key={img + idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-20 aspect-square shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        current === idx ? "border-black" : "border-transparent"
                    }`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full md:w-1/2 flex flex-col gap-4">
            {isSideLayout ? (
                <div className="flex gap-4 items-start">
                    {thumbnails}
                    <div className="flex-1">{mainImage}</div>
                </div>
            ) : (
                <>
                    {mainImage}
                    {thumbnails}
                </>
            )}

            {isLightboxOpen && (
                <div className="fixed inset-0 bg-white z-[200] overflow-y-auto">
                    <div className="sticky top-0 left-0 w-full p-6 flex justify-end z-10">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            aria-label="Close gallery"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                    <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8 flex flex-col items-center">
                        {gallery.map((img, idx) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img key={img + idx} src={img} alt={`${productName} ${idx + 1}`} className="w-full max-w-3xl rounded-2xl border border-gray-100" loading="lazy" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
