"use client";

import type { SparkColumnBlock, SparkMulticolumnSettings } from "../sparkConfig";

interface MulticolumnProps {
    settings: SparkMulticolumnSettings;
    // Already filtered for hidden and in the merchant's chosen order —
    // Column is a single homogeneous block type (capped at 4), same shape
    // as Banner Slide, not Rich Text's mixed-type list.
    blocks: SparkColumnBlock[];
    isEditorPreview?: boolean;
    activeBlockId?: string | null;
    onBlockClick?: (id: string) => void;
}

// Full port of Fype-E-Commerce-UI's sections/Multicolumn.tsx (read-only
// design reference) — pure static content, no real/mock data distinction
// needed (unlike Featured Collection/Product). `font` on each column's
// settings is vestigial (see sparkConfig.ts's SparkColumnBlockSettings
// comment) — the reference's own Multicolumn.tsx never applies it either,
// so it's read here for nothing, matching actual reference behavior.
export default function Multicolumn({ settings, blocks, isEditorPreview = false, activeBlockId = null, onBlockClick }: MulticolumnProps) {
    const colsClass = settings.columns_on_desktop === 4 ? "md:grid-cols-4" : settings.columns_on_desktop === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
    const alignClass = settings.column_alignment === "Left" ? "text-left" : "text-center";

    return (
        <section
            className="border-b border-gray-100 relative"
            style={{ backgroundColor: settings.background_color, paddingTop: `${settings.padding_top}px`, paddingBottom: `${settings.padding_bottom}px` }}
        >
            <div className="max-w-7xl mx-auto px-6">
                {settings.section_heading && (
                    <div className="text-center mb-16">
                        <h2 className="font-bold tracking-tight mb-4 text-3xl md:text-4xl">{settings.section_heading}</h2>
                    </div>
                )}

                <div className={`grid gap-8 md:gap-12 grid-cols-1 ${colsClass} ${alignClass}`}>
                    {blocks.map((block) => {
                        const isActive = isEditorPreview && activeBlockId === block.id;
                        const content = (
                            <>
                                {block.settings.image_url && (
                                    <div className={`w-16 h-16 bg-gray-50 rounded-full mb-6 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden ${alignClass === "text-center" ? "mx-auto" : ""}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={block.settings.image_url}
                                            alt=""
                                            className={block.settings.image_url.includes("image/svg+xml") ? "w-6 h-6 object-contain" : "w-full h-full object-cover"}
                                        />
                                    </div>
                                )}
                                {block.settings.heading &&
                                    (block.settings.link ? (
                                        <a href={block.settings.link} className="hover:underline transition-all group/link">
                                            <h3
                                                className="text-xl font-bold mb-3 text-gray-900 group-hover/link:text-blue-600 transition-colors"
                                                dangerouslySetInnerHTML={{ __html: block.settings.heading }}
                                            />
                                        </a>
                                    ) : (
                                        <h3 className="text-xl font-bold mb-3 text-gray-900" dangerouslySetInnerHTML={{ __html: block.settings.heading }} />
                                    ))}
                                {block.settings.text && (
                                    <div
                                        className="text-gray-500 leading-relaxed text-base [&>p]:mb-2 last:[&>p]:mb-0 [&_strong]:font-semibold [&_em]:italic"
                                        dangerouslySetInnerHTML={{ __html: block.settings.text }}
                                    />
                                )}
                            </>
                        );

                        if (!isEditorPreview) {
                            return (
                                <div key={block.id}>
                                    {content}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={block.id}
                                className={`cursor-pointer rounded-md ${isActive ? "ring-2 ring-blue-500 relative z-10" : "hover:ring-1 hover:ring-blue-300"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onBlockClick?.(block.id);
                                }}
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>

                {blocks.length === 0 && (
                    <div className="w-full text-center text-gray-400 p-8 border border-dashed border-gray-300">Multicolumn — add a column</div>
                )}
            </div>
        </section>
    );
}
