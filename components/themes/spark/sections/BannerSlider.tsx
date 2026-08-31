"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import type { SparkBannerSlideBlock, SparkImageBannerSettings } from "../sparkConfig";

interface BannerSliderProps {
    settings: SparkImageBannerSettings;
    slides: SparkBannerSlideBlock[];
    // Editor-preview-only: lets the merchant click the current slide directly
    // in the live canvas to select it (a whole Banner Slide is one block —
    // unlike Text/Button, its properties aren't independently sub-selectable).
    // Undefined on real storefront traffic.
    isEditorPreview?: boolean;
    activeSlideId?: string | null;
    onSlideClick?: (id: string) => void;
}

// Full port of Fype-E-Commerce-UI's src/components/BannerSlider.tsx
// (read-only design reference) — replaces the old static ImageBanner.tsx
// (see Fype-E-Commerce-UI commit c9cb197 "replace ImageBanner with
// BannerSlider"). Autoplay follows each slide's own "Appear After" value
// so the timing can vary per slide, matching the editor control. Drag-to-
// reposition the image isn't reimplemented (editor-only interaction
// convenience needing a postMessage drag protocol across the iframe
// boundary) — Object Position X/Y is still fully editable via sliders in
// the editor.
function getReadableTextColor(hex: string): string {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#000000';
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.72 ? '#111827' : '#ffffff';
}

export default function BannerSlider({ settings, slides, isEditorPreview = false, activeSlideId = null, onSlideClick }: BannerSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeSlideIndex = activeSlideId ? slides.findIndex((s) => s.id === activeSlideId) : -1;
    // Editor selection overrides autoplay's position outright — derived
    // rather than synced into currentIndex via an effect, so there's never
    // an out-of-sync frame between selecting a slide and the display
    // catching up.
    const isSlideSelectedInEditor = isEditorPreview && activeSlideIndex !== -1;

    useEffect(() => {
        // Disable autoplay while a slide from this banner is selected in the editor.
        if (isSlideSelectedInEditor) return;
        if (slides.length <= 1) return;

        const activeSlide = slides[currentIndex % slides.length];
        const delaySeconds = activeSlide?.settings.appear_after || 5;
        const timer = window.setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, delaySeconds * 1000);

        return () => window.clearTimeout(timer);
    }, [isSlideSelectedInEditor, slides, currentIndex]);

    let heightClass = "min-h-[750px] lg:min-h-[850px]";
    if (settings.banner_height === "Small") heightClass = "min-h-[400px] lg:min-h-[500px]";
    if (settings.banner_height === "Medium") heightClass = "min-h-[550px] lg:min-h-[650px]";

    if (slides.length === 0) {
        return <div className={`w-full flex items-center justify-center bg-gray-100 ${heightClass}`} />;
    }

    const safeIndex = isSlideSelectedInEditor ? activeSlideIndex : currentIndex >= slides.length ? 0 : currentIndex;
    const slide = slides[safeIndex];
    const s = slide.settings;

    const headingHtml = s.heading_text || "";
    const bodyHtml = s.text || "";

    let objectFitClass = "object-cover";
    if (s.image_fit === "Contain") objectFitClass = "object-contain";
    if (s.image_fit === "Stretch") objectFitClass = "object-fill";
    if (s.image_fit === "Original Size") objectFitClass = "object-none";

    let horizAlign = "items-center text-center";
    if (s.content_horizontal_alignment === "Left") horizAlign = "items-start text-left";
    if (s.content_horizontal_alignment === "Right") horizAlign = "items-end text-right";

    let vertAlign = "justify-center";
    if (s.content_vertical_alignment === "Top") vertAlign = "justify-start pt-20";
    if (s.content_vertical_alignment === "Bottom") vertAlign = "justify-end pb-20";

    let headingSizeClass = "text-5xl md:text-[5rem]";
    if (s.heading_size === "Small") headingSizeClass = "text-4xl md:text-5xl";
    if (s.heading_size === "Large") headingSizeClass = "text-6xl md:text-[6rem]";

        return (
            <div
                id={`spark-block-${slide.id}`}
                className={`relative w-full overflow-hidden flex flex-col ${heightClass} ${isEditorPreview ? "group/block" : ""}`}
                style={{
                    backgroundColor: settings.background_color,
                    paddingTop: `${settings.padding_top}px`,
                    paddingBottom: `${settings.padding_bottom}px`,
                }}
            onClick={(e) => {
                if (!isEditorPreview) return;
                e.stopPropagation();
                e.preventDefault();
                onSlideClick?.(slide.id);
            }}
        >
            <AnimatePresence>
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute inset-0 w-full h-full ${isEditorPreview ? "cursor-pointer" : ""}`}
                >
                    {s.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element -- store-uploaded/arbitrary remote hero image, position/fit are runtime settings
                        <img
                            src={s.image_url}
                            alt=""
                            draggable={false}
                            className={`absolute inset-0 w-full h-full select-none ${objectFitClass}`}
                            style={{ objectPosition: `${s.object_position_x}% ${s.object_position_y}%` }}
                        />
                    )}
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: s.overlay_color, opacity: (s.overlay_opacity ?? 40) / 100 }} />
                </motion.div>
            </AnimatePresence>

            <div
                className={`relative z-10 flex flex-col flex-1 w-full ${horizAlign} ${vertAlign} px-8 md:px-16 lg:px-24 w-full gap-6 pointer-events-none`}
                style={{ paddingTop: 0, paddingBottom: 0 }}
            >
                {headingHtml && (
                    <motion.h2
                        key={`title-${slide.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`font-medium tracking-tight text-white leading-tight ${headingSizeClass} max-w-5xl [&_p]:m-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:underline [&_a]:underline-offset-4`}
                        style={{ color: s.heading_color }}
                        dangerouslySetInnerHTML={{ __html: headingHtml }}
                    />
                )}
                {bodyHtml && (
                    <motion.div
                        key={`text-${slide.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className={`text-white/80 ${s.text_style === "Subtitle" ? "tracking-[0.2em] text-xs sm:text-sm font-semibold uppercase" : "text-base sm:text-lg"} max-w-2xl [&_p]:m-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:underline [&_a]:underline-offset-4`}
                        style={{ color: s.text_color }}
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                )}
                {s.button_label && (
                    <motion.div
                        key={`btn-${slide.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="pointer-events-auto mt-4"
                    >
                        <Link
                            href={s.button_link || "#"}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-8 py-3.5 rounded-full uppercase tracking-widest text-xs font-medium transition-colors inline-block ${
                                s.button_style === "Filled"
                                    ? "hover:opacity-90"
                                    : `hover:bg-white hover:text-[${getReadableTextColor(s.button_color || '#ffffff')}] border border-[${s.button_color || '#ffffff'}] bg-transparent`
                            }`}
                            style={
                                s.button_style === "Filled"
                                    ? { backgroundColor: s.button_color || "#ffffff", color: s.button_text_color || "#000000" }
                                    : { borderColor: s.button_color, color: s.button_color }
                            }
                        >
                            {s.button_label}
                        </Link>
                    </motion.div>
                )}
            </div>

            {slides.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                    {slides.map((slideItem, idx) => (
                        <button
                            key={slideItem.id}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === safeIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                        />
                    ))}
                </div>
            )}

            {isEditorPreview && (
                <div
                    className={`absolute inset-0 pointer-events-none z-50 ${
                        activeSlideId === slide.id ? "ring-2 ring-blue-500 ring-inset" : "group-hover/block:ring-2 group-hover/block:ring-blue-400 ring-inset"
                    }`}
                >
                    <div
                        className={`absolute top-0 left-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 whitespace-nowrap transition-opacity ${
                            activeSlideId === slide.id ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
                        }`}
                    >
                        Banner Slide
                    </div>
                </div>
            )}
        </div>
    );
}
