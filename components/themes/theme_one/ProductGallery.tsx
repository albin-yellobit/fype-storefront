"use client";

import { useState, useEffect, useRef } from "react";

// ─── Lightbox (Desktop full-screen gallery overlay) ──────────────────────────
interface LightboxProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
    const [current, setCurrent] = useState(initialIndex);
    const thumbnailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = thumbnailRef.current?.querySelector(`[data-idx="${current}"]`) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [current]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
            if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [images.length, onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(15,15,20,0.82)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                animation: "lbFadeIn 0.2s ease",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <style>{`
        @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbImgIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        .lb-thumb::-webkit-scrollbar { height: 4px; }
        .lb-thumb::-webkit-scrollbar-track { background: transparent; }
        .lb-thumb::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius:4px; }
      `}</style>

            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 16,
                    right: 20,
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 32,
                    cursor: "pointer",
                    zIndex: 10,
                    lineHeight: 1,
                    opacity: 0.8,
                }}
                aria-label="Close gallery"
            >
                ✕
            </button>

            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13, paddingTop: 18, letterSpacing: "0.05em" }}>
                {current + 1} / {images.length}
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "0 60px" }}>
                <button onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} style={navBtnStyle("left")} aria-label="Previous">
                    ‹
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={current}
                    src={images[current]}
                    alt={`Product image ${current + 1}`}
                    style={{ maxHeight: "calc(100vh - 180px)", maxWidth: "100%", objectFit: "contain", borderRadius: 4, animation: "lbImgIn 0.25s ease" }}
                />

                <button onClick={() => setCurrent((c) => (c + 1) % images.length)} style={navBtnStyle("right")} aria-label="Next">
                    ›
                </button>
            </div>

            <div
                ref={thumbnailRef}
                className="lb-thumb"
                style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 24px 20px", justifyContent: images.length <= 6 ? "center" : "flex-start" }}
            >
                {images.map((img, i) => (
                    <button
                        key={i}
                        data-idx={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            flexShrink: 0,
                            width: 64,
                            height: 64,
                            border: i === current ? "2px solid #fff" : "2px solid transparent",
                            borderRadius: 6,
                            overflow: "hidden",
                            cursor: "pointer",
                            background: "none",
                            padding: 0,
                            opacity: i === current ? 1 : 0.55,
                            transition: "opacity 0.15s, border-color 0.15s",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function navBtnStyle(side: "left" | "right"): React.CSSProperties {
    return {
        position: "absolute",
        [side]: 12,
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        borderRadius: "50%",
        width: 44,
        height: 44,
        fontSize: 28,
        lineHeight: "44px",
        textAlign: "center",
        cursor: "pointer",
        backdropFilter: "blur(4px)",
        transition: "background 0.15s",
    };
}

// ─── Mobile Swipe Overlay ─────────────────────────────────────────────────────
interface MobileOverlayProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

function MobileOverlay({ images, initialIndex, onClose }: MobileOverlayProps) {
    const [current, setCurrent] = useState(initialIndex);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            if (dx < 0) setCurrent((c) => (c + 1) % images.length);
            else setCurrent((c) => (c - 1 + images.length) % images.length);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(15,15,20,0.82)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                display: "flex",
                flexDirection: "column",
                animation: "lbFadeIn 0.2s ease",
            }}
        >
            <style>{`@keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 16px", position: "relative" }}>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", lineHeight: 1 }} aria-label="Close">
                    ✕
                </button>
            </div>

            <div
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", userSelect: "none" }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={current}
                    src={images[current]}
                    alt={`Product image ${current + 1}`}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", animation: "lbFadeIn 0.2s ease" }}
                    draggable={false}
                />
            </div>

            <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "16px 0 24px" }}>
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            width: i === current ? 20 : 7,
                            height: 7,
                            borderRadius: 4,
                            background: i === current ? "#fff" : "rgba(255,255,255,0.35)",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "width 0.2s, background 0.2s",
                        }}
                        aria-label={`Go to image ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Desktop Thumbnail Grid ───────────────────────────────────────────────────
const DESKTOP_THUMB_LIMIT = 4;

interface DesktopImageGridProps {
    images: string[];
    selectedImage: number;
    onSelectImage: (i: number) => void;
    onOpenLightbox: (i: number) => void;
}

function DesktopImageGrid({ images, selectedImage, onSelectImage, onOpenLightbox }: DesktopImageGridProps) {
    const remaining = images.length - DESKTOP_THUMB_LIMIT;
    const showOverflow = images.length > DESKTOP_THUMB_LIMIT;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {images.slice(0, showOverflow ? DESKTOP_THUMB_LIMIT : images.length).map((img, i) => (
                <button
                    key={i}
                    onClick={() => onSelectImage(i)}
                    style={{
                        border: selectedImage === i ? "2px solid #222" : "2px solid transparent",
                        borderRadius: 6,
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "none",
                        padding: 0,
                        width: 68,
                        height: 68,
                        flexShrink: 0,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
            ))}

            {showOverflow && (
                <button
                    onClick={() => onOpenLightbox(DESKTOP_THUMB_LIMIT)}
                    style={{
                        width: 68,
                        height: 68,
                        borderRadius: 6,
                        overflow: "hidden",
                        position: "relative",
                        border: "2px solid #ddd",
                        cursor: "pointer",
                        background: "none",
                        padding: 0,
                        flexShrink: 0,
                    }}
                    aria-label={`View all ${images.length} images`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={images[DESKTOP_THUMB_LIMIT]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(20,20,30,0.52)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 15,
                            letterSpacing: "0.02em",
                        }}
                    >
                        +{remaining}
                    </div>
                </button>
            )}
        </div>
    );
}

// ─── Mobile Carousel ──────────────────────────────────────────────────────────
interface MobileCarouselProps {
    images: string[];
    onOpenOverlay: (i: number) => void;
}

function MobileCarousel({ images, onOpenOverlay }: MobileCarouselProps) {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            if (dx < 0) setCurrent((c) => (c + 1) % images.length);
            else setCurrent((c) => (c - 1 + images.length) % images.length);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (images.length === 0) {
        return (
            <div style={{ position: "relative", width: "100%", userSelect: "none" }}>
                <div style={{ overflow: "hidden", borderRadius: 8, aspectRatio: "1/1", background: "#f5f5f5" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/placeholder-product.png" alt="Placeholder" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} draggable={false} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", width: "100%", userSelect: "none" }}>
            <div
                style={{ overflow: "hidden", borderRadius: 8, aspectRatio: "1/1", background: "#f5f5f5" }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => onOpenOverlay(current)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={current}
                    src={images[current]}
                    alt={`Product image ${current + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in", animation: "lbFadeIn 0.18s ease" }}
                    draggable={false}
                />
                <style>{`@keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(20,20,30,0.45)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 20,
                    padding: "2px 10px",
                    letterSpacing: "0.04em",
                    backdropFilter: "blur(4px)",
                }}
            >
                {current + 1} / {images.length}
            </div>

            {images.length > 1 && (
                <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 10 }}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            style={{
                                width: i === current ? 18 : 6,
                                height: 6,
                                borderRadius: 3,
                                background: i === current ? "#222" : "#ccc",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                transition: "width 0.2s, background 0.2s",
                            }}
                            aria-label={`Go to image ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Gallery (combines all of the above) ───────────────────────────────────────
interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [mobileOverlayIndex, setMobileOverlayIndex] = useState<number | null>(null);

    // Reset the selected image when the image set changes (e.g. variant switch) —
    // adjusted during render, not in an effect, per React's guidance on deriving
    // state from prop changes (avoids an extra commit/re-render cascade).
    const [prevImages, setPrevImages] = useState(images);
    if (images !== prevImages) {
        setPrevImages(images);
        setSelectedImage(0);
    }

    return (
        <>
            {lightboxIndex !== null && <Lightbox images={images} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
            {mobileOverlayIndex !== null && <MobileOverlay images={images} initialIndex={mobileOverlayIndex} onClose={() => setMobileOverlayIndex(null)} />}

            <div className="hidden md:flex gap-3 md:w-1/2 sticky top-4 self-start">
                {images.length > 1 && (
                    <DesktopImageGrid images={images} selectedImage={selectedImage} onSelectImage={setSelectedImage} onOpenLightbox={(i) => setLightboxIndex(i)} />
                )}

                <div
                    className="flex-1 relative inline-block"
                    style={{ background: "#f8f8f8", borderRadius: 6, overflow: "hidden", cursor: "zoom-in" }}
                    onClick={() => setLightboxIndex(selectedImage)}
                >
                    {images.length > 0 ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={images[selectedImage]} alt={productName} style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                    background: "rgba(0,0,0,0.4)",
                                    color: "#fff",
                                    borderRadius: 3,
                                    padding: "2px 7px",
                                    fontSize: 10,
                                    backdropFilter: "blur(4px)",
                                    pointerEvents: "none",
                                }}
                            >
                                🔍 Click to zoom
                            </div>
                        </>
                    ) : (
                        <div className="w-full min-h-[400px] flex items-center justify-center bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/placeholder-product.png" alt="No Image" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                        </div>
                    )}
                </div>
            </div>

            <div className="md:hidden w-full">
                <MobileCarousel images={images} onOpenOverlay={(i) => setMobileOverlayIndex(i)} />
            </div>
        </>
    );
}
