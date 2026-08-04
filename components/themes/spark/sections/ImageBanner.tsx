"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import type { SparkImageBannerSettings } from "../sparkConfig";

interface ImageBannerProps {
    settings: SparkImageBannerSettings;
    // Editor-preview-only: lets the merchant click a specific Text/Button
    // block directly in the live canvas, matching the reference's per-block
    // click selection. Undefined on real storefront traffic.
    isEditorPreview?: boolean;
    activeBlock?: { kind: "text" | "button"; id: string } | null;
    onBlockClick?: (kind: "text" | "button", id: string) => void;
}

// Full port of Fype-E-Commerce-UI's sections/ImageBanner.tsx (read-only
// design reference) — every section setting (Content Alignment, Background
// Color, Padding, Banner Height), Image block property (Image Fit, Overlay
// Color/Opacity, Object Position X/Y) and repeatable Heading/Text/Button
// block is wired up. The reference's drag-to-reposition on the image is an
// editor-only interaction convenience layered on top of the same Object
// Position X/Y setting (itself documented as a plain 0–100% slider in
// THEME_SCHEMA) — not reimplemented here since it'd need a postMessage
// drag protocol across the editor/iframe boundary; the setting itself is
// still fully editable via sliders in SparkCustomizeTheme.tsx.
export default function ImageBanner({ settings, isEditorPreview = false, activeBlock = null, onBlockClick }: ImageBannerProps) {
    const {
        content_horizontal_alignment: hAlign,
        content_vertical_alignment: vAlign,
        background_color: bgColor,
        padding_top: paddingTop,
        padding_bottom: paddingBottom,
        banner_height: bannerHeight,
        image,
        heading,
        text_blocks: textBlocks,
        button_blocks: buttonBlocks,
    } = settings;

    let horizontalJustify = "justify-center";
    let horizontalItems = "items-center text-center";
    if (hAlign === "Left") {
        horizontalJustify = "justify-start";
        horizontalItems = "items-start text-left";
    }
    if (hAlign === "Right") {
        horizontalJustify = "justify-end";
        horizontalItems = "items-end text-right";
    }

    let verticalItems = "items-center";
    if (vAlign === "Top") verticalItems = "items-start pt-16 lg:pt-32";
    if (vAlign === "Bottom") verticalItems = "items-end pb-16 lg:pb-32";

    let heightClass = "min-h-[750px] lg:min-h-[850px]";
    if (bannerHeight === "Small") heightClass = "min-h-[400px] lg:min-h-[500px]";
    if (bannerHeight === "Medium") heightClass = "min-h-[550px] lg:min-h-[650px]";

    let objectFitClass = "object-cover";
    if (image.image_fit === "Contain") objectFitClass = "object-contain";
    if (image.image_fit === "Stretch") objectFitClass = "object-fill";
    if (image.image_fit === "Original Size") objectFitClass = "object-none";

    let headingSizeClass = "text-6xl md:text-[5rem]";
    if (heading.size === "Small") headingSizeClass = "text-5xl md:text-6xl";
    if (heading.size === "Large") headingSizeClass = "text-[5rem] md:text-[6rem]";

    const wrapBlock = (kind: "text" | "button", id: string, children: React.ReactNode) => {
        if (!isEditorPreview) return children;
        const isActive = activeBlock?.kind === kind && activeBlock.id === id;
        return (
            <div
                className={`cursor-pointer rounded-sm ${isActive ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onBlockClick?.(kind, id);
                }}
            >
                {children}
            </div>
        );
    };

    return (
        <section
            className="relative overflow-hidden w-full"
            style={{ backgroundColor: bgColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
        >
            <div className={`relative flex ${horizontalJustify} ${verticalItems} w-full ${heightClass}`}>
                {image.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element -- store-uploaded/arbitrary remote hero image, position/fit are runtime settings
                    <img
                        src={image.image_url}
                        alt=""
                        draggable={false}
                        className={`absolute inset-0 w-full h-full select-none pointer-events-none ${objectFitClass}`}
                        style={{ objectPosition: `${image.object_position_x}% ${image.object_position_y}%` }}
                    />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: image.overlay_color, opacity: image.overlay_opacity / 100 }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`relative z-20 max-w-4xl px-6 flex flex-col gap-6 w-full ${horizontalItems}`}
                >
                    {heading.text && (
                        <h1 className={`font-medium tracking-tight leading-tight ${headingSizeClass}`} style={{ color: heading.color }}>
                            {heading.text}
                        </h1>
                    )}

                    {textBlocks.map((block) => {
                        const styleClass =
                            block.settings.style === "Subtitle"
                                ? "tracking-[0.2em] text-xs sm:text-sm font-semibold block uppercase"
                                : "text-base sm:text-lg block";
                        return (
                            <Fragment key={block.id}>
                                {wrapBlock(
                                    "text",
                                    block.id,
                                    <span className={styleClass} style={{ color: block.settings.color }}>
                                        {block.settings.text}
                                    </span>
                                )}
                            </Fragment>
                        );
                    })}

                    {buttonBlocks.length > 0 && (
                        <div
                            className={`flex flex-wrap gap-4 ${
                                horizontalJustify === "justify-center" ? "justify-center" : horizontalJustify === "justify-start" ? "justify-start" : "justify-end"
                            }`}
                        >
                            {buttonBlocks.map((block) => (
                                <Fragment key={block.id}>
                                    {wrapBlock(
                                        "button",
                                        block.id,
                                        block.settings.style === "Filled" ? (
                                            <Link
                                                href={block.settings.link || "#"}
                                                className="px-8 py-3.5 font-medium rounded-full transition-opacity hover:opacity-90 uppercase tracking-widest text-xs inline-block text-black"
                                                style={{ backgroundColor: block.settings.button_color }}
                                            >
                                                {block.settings.label}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={block.settings.link || "#"}
                                                className="px-8 py-3.5 bg-transparent border font-medium rounded-full hover:opacity-80 transition-opacity uppercase tracking-widest text-xs inline-block"
                                                style={{ borderColor: block.settings.button_color, color: block.settings.button_color }}
                                            >
                                                {block.settings.label}
                                            </Link>
                                        )
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
