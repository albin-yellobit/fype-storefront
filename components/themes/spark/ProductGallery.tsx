"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface SparkProductGalleryProps {
    images: string[];
    productName: string;
    imageLayout?: "Main + Thumbnails Below" | "Main + Thumbnails Side" | "Single Image";
    isNew?: boolean;
}

const FALLBACK_IMAGE = "/placeholder-product.png";

export default function ProductGallery({
    images,
    productName,
    imageLayout = "Main + Thumbnails Below",
    isNew = false,
}: SparkProductGalleryProps) {
    const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
    const [current, setCurrent] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [maxThumbnails, setMaxThumbnails] = useState(5);
    const [maxSideThumbnails, setMaxSideThumbnails] = useState(4);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const mainImageRef = useRef<HTMLDivElement>(null);

    const [prevGallery, setPrevGallery] = useState(gallery);
    if (gallery !== prevGallery && gallery.join("|") !== prevGallery.join("|")) {
        setPrevGallery(gallery);
        setCurrent(0);
    }

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => setIsMobile(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (imageContainerRef.current && entry.target === imageContainerRef.current) {
                    const capacity = Math.floor((entry.contentRect.width + 16) / 96);
                    setMaxThumbnails(Math.max(3, capacity));
                }
                if (mainImageRef.current && entry.target === mainImageRef.current) {
                    const height = entry.contentRect.height;
                    if (height > 0) {
                        const capacity = Math.floor((height + 12) / 92);
                        setMaxSideThumbnails(Math.max(2, capacity));
                    }
                }
            }
        });
        if (imageContainerRef.current) observer.observe(imageContainerRef.current);
        if (mainImageRef.current) observer.observe(mainImageRef.current);
        return () => observer.disconnect();
    }, [imageLayout, isMobile]);

    useEffect(() => {
        if (!isGalleryOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsGalleryOpen(false);
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [isGalleryOpen]);

    const newBadge = isNew ? (
        <span className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded-sm tracking-wider z-10">
            New
        </span>
    ) : null;

    const renderThumbs = (vertical: boolean) => {
        const cap = vertical ? maxSideThumbnails : maxThumbnails;
        const showMore = !isMobile && gallery.length > cap;
        const visible = showMore ? gallery.slice(0, cap) : gallery;
        const hiddenCount = gallery.length - cap + 1;

        return visible.map((img, idx) => {
            const isLast = showMore && idx === cap - 1;
            return (
                <button
                    key={img + idx}
                    type="button"
                    onClick={() => (isLast ? setIsGalleryOpen(true) : setCurrent(idx))}
                    className={`w-20 aspect-square shrink-0 rounded-lg overflow-hidden border-2 transition-colors relative ${
                        current === idx && !isLast ? "border-black" : "border-transparent"
                    }`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
                    {isLast && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                            <span className="font-medium text-lg leading-none pt-1">+{hiddenCount}</span>
                        </div>
                    )}
                </button>
            );
        });
    };

    const mainImage = (
        <div
            ref={imageLayout === "Main + Thumbnails Side" && !isMobile ? mainImageRef : undefined}
            className={`aspect-square bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden relative isolate ${
                imageLayout === "Main + Thumbnails Side" && !isMobile ? "flex-1 min-w-0" : "w-full"
            }`}
        >
            <AnimatePresence mode="wait">
                <motion.img
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_e, { offset, velocity }) => {
                        if (offset.x < -50 || velocity.x < -500) {
                            if (current < gallery.length - 1) setCurrent(current + 1);
                        } else if (offset.x > 50 || velocity.x > 500) {
                            if (current > 0) setCurrent(current - 1);
                        }
                    }}
                    src={gallery[current]}
                    alt={productName}
                    className="w-full h-full object-cover pointer-events-auto"
                />
            </AnimatePresence>
            {isMobile && imageLayout !== "Single Image" && gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {gallery.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md border border-white/20 ${
                                idx === current ? "w-4 bg-white/90" : "w-1.5 bg-white/40"
                            }`}
                        />
                    ))}
                </div>
            )}
            {newBadge}
        </div>
    );

    return (
        <div className="w-full md:w-1/2 min-w-0 overflow-hidden">
            {imageLayout === "Main + Thumbnails Side" && !isMobile ? (
                <div className="flex gap-4 items-start min-w-0">
                    <div className="w-20 shrink-0 flex flex-col gap-3 overflow-hidden">{renderThumbs(true)}</div>
                    {mainImage}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {mainImage}
                    {imageLayout !== "Single Image" && gallery.length > 1 && (
                        <div
                            ref={imageContainerRef}
                            className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {renderThumbs(false)}
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white z-[200] overflow-y-auto"
                    >
                        <div className="sticky top-0 left-0 w-full p-6 flex justify-end z-10 pointer-events-none">
                            <button
                                type="button"
                                onClick={() => setIsGalleryOpen(false)}
                                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors pointer-events-auto"
                                aria-label="Close gallery"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="max-w-4xl mx-auto px-6 pb-20 space-y-8 flex flex-col items-center">
                            {gallery.map((img, idx) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={img + idx}
                                    src={img}
                                    alt={`${productName} ${idx + 1}`}
                                    className="w-full max-w-3xl rounded-2xl border border-gray-100 shadow-sm"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
