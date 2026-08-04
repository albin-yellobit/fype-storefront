"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { SparkAnnouncementBarBlock, SparkHeaderSettings } from "./sparkConfig";

interface SparkHeaderProps {
    header: SparkHeaderSettings;
    navItems: Array<{ label: string; href: string }>;
    announcementBlocks: SparkAnnouncementBarBlock[];
    // Editor-preview-only: lets the merchant click a specific announcement
    // block directly in the live canvas (not just pick it from the editor's
    // own block list) and see it highlighted, matching the reference's
    // per-block click selection. Undefined on real storefront traffic.
    isEditorPreview?: boolean;
    activeAnnouncementId?: string | null;
    onAnnouncementClick?: (id: string) => void;
}

const REPEAT_COUNT = 10;

// Full port of Fype-E-Commerce-UI's sections/Header.tsx (read-only design
// reference) — every section setting (Logo Type/Position, Menu Style,
// Sticky Header, Glass Effect, Background/Foreground Color) and every
// Announcement Bar block property (Text, Link, Text Animation, Speed, Appear
// After, per-block colors, multi-block rotation) is wired up here, matching
// the reference 1:1. Client Component because the Scroll marquee and Slide
// rotation both need timers/animation state.
export default function Header({
    header,
    navItems,
    announcementBlocks,
    isEditorPreview = false,
    activeAnnouncementId = null,
    onAnnouncementClick,
}: SparkHeaderProps) {
    const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const numBlocks = announcementBlocks.length;
    // Blocks can be added/removed/reordered by the editor while this is
    // mounted (live preview) — derive instead of syncing currentAnnouncement
    // to numBlocks via an effect, so there's never an out-of-bounds frame.
    const activeIndex = numBlocks > 0 ? currentAnnouncement % numBlocks : 0;
    const isScroll = announcementBlocks[0]?.settings.text_animation === "Scroll";
    const appearAfter = announcementBlocks[activeIndex]?.settings.appear_after || 5;

    useEffect(() => {
        if (numBlocks <= 1 || isScroll) return;
        const timer = setTimeout(() => {
            setCurrentAnnouncement((prev) => (prev + 1) % numBlocks);
        }, appearAfter * 1000);
        return () => clearTimeout(timer);
    }, [numBlocks, isScroll, appearAfter, activeIndex]);

    const firstAnnouncement = announcementBlocks[0]?.settings;
    const speedSetting = firstAnnouncement?.speed || 20;
    const scrollDuration = `${speedSetting * REPEAT_COUNT}s`;

    const activeBlockSettings = announcementBlocks[activeIndex]?.settings;
    const containerBgColor = isScroll ? "transparent" : activeBlockSettings?.background_color || "#111111";
    const containerTextColor = isScroll ? "inherit" : activeBlockSettings?.text_color || "#ffffff";

    const {
        logo_type: logoType,
        logo_text: logoText,
        logo_image_url: logoImageUrl,
        logo_position: logoPosition,
        menu_style: menuStyle,
        sticky_header: isSticky,
        glass_effect: glassEffect,
        background_color: bgColor,
        foreground_color: fgColor,
    } = header;

    const headerClass = `z-40 transition-colors duration-300 border-b ${isSticky ? "sticky top-0" : ""} ${glassEffect ? "backdrop-blur-md bg-opacity-90" : ""}`;
    const headerStyle = {
        backgroundColor: bgColor,
        color: fgColor,
        borderColor: fgColor === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    };

    const logoContent = (
        <Link href="/" className="flex items-center gap-3">
            {(logoType === "Logo Image" || logoType === "Text + Logo Image") && logoImageUrl && (
                <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- store-uploaded logo, arbitrary remote origin not worth a next/image remotePatterns entry for an 8x8 avatar-style crop */}
                    <img src={logoImageUrl} className="w-full h-full object-cover" alt={logoText || "Logo"} />
                </span>
            )}
            {(logoType === "Text Only" || logoType === "Text + Logo Image") && (
                <span className="font-black tracking-tighter text-2xl hover:opacity-80 transition-opacity">{logoText}</span>
            )}
        </Link>
    );

    const navContent = (
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide uppercase">
            {navItems.map((item) => (
                <Link key={item.label} href={item.href} className="opacity-80 hover:opacity-100 transition-opacity">
                    {item.label}
                </Link>
            ))}
        </nav>
    );

    const iconLinks = (
        <div className="flex items-center gap-5">
            <Link href="/products" className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-xl">search</span>
            </Link>
            <Link href="/accounts" className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-xl">person</span>
            </Link>
            <Link href="/cart" className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-xl">shopping_bag</span>
            </Link>
        </div>
    );

    const renderAnnouncementContent = (block: SparkAnnouncementBarBlock) => {
        const link = block.settings.link;
        const content = (
            <div
                dangerouslySetInnerHTML={{ __html: block.settings.text || "Welcome to our store" }}
                className="[&_p]:inline [&_p]:m-0"
            />
        );
        const inner = link ? (
            <a href={link} className="hover:opacity-80 transition-opacity">
                {content}
            </a>
        ) : (
            content
        );

        if (!isEditorPreview) return inner;

        const isActive = activeAnnouncementId === block.id;
        return (
            <div
                className={`cursor-pointer rounded-sm ${isActive ? "ring-2 ring-blue-500" : "hover:ring-1 hover:ring-blue-300"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onAnnouncementClick?.(block.id);
                }}
            >
                {inner}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col font-sans">
            {/* ANNOUNCEMENT BAR */}
            {announcementBlocks.length > 0 && (
                <div
                    className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase relative z-50 flex items-center h-[34px] sm:h-[36px] overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: containerBgColor, color: containerTextColor }}
                >
                    {isScroll ? (
                        <div className="w-full overflow-hidden whitespace-nowrap flex group h-full">
                            {[0, 1].map((marqueeIndex) => (
                                <div
                                    key={marqueeIndex}
                                    className="flex animate-marquee group-hover:[animation-play-state:paused] h-full shrink-0 min-w-full"
                                    style={{ animationDuration: scrollDuration }}
                                    aria-hidden={marqueeIndex === 1}
                                >
                                    {Array(REPEAT_COUNT)
                                        .fill(announcementBlocks)
                                        .flat()
                                        .map((block: SparkAnnouncementBarBlock, index: number) => (
                                            <div
                                                key={`${marqueeIndex}_${block.id}_${index}`}
                                                className="px-8 shrink-0 flex items-center h-full transition-colors duration-500"
                                                style={{
                                                    backgroundColor: block.settings.background_color || "#111111",
                                                    color: block.settings.text_color || "#ffffff",
                                                }}
                                            >
                                                {renderAnnouncementContent(block)}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    ) : announcementBlocks.length === 1 ? (
                        <div className="w-full flex items-center justify-center px-4 h-full">
                            <div className="text-center w-full">{renderAnnouncementContent(announcementBlocks[0])}</div>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center relative h-full">
                            <AnimatePresence mode="popLayout">
                                {announcementBlocks.map((block, index) => {
                                    if (index !== activeIndex) return null;
                                    return (
                                        <motion.div
                                            key={block.id}
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="absolute text-center w-full h-full flex items-center justify-center px-4"
                                        >
                                            <div className="w-full">{renderAnnouncementContent(block)}</div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}

            {/* HEADER */}
            <header className={headerClass} style={headerStyle}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {logoPosition === "Left" ? (
                        <>
                            <div className="flex items-center gap-6">
                                {menuStyle === "Drawer" && (
                                    <button
                                        onClick={() => setMobileMenuOpen(true)}
                                        aria-label="Open menu"
                                        className="transition-colors hover:opacity-70 block"
                                    >
                                        <span className="material-symbols-outlined text-2xl">menu</span>
                                    </button>
                                )}
                                {logoContent}
                            </div>

                            {menuStyle === "Tabs" && <div className="hidden md:flex flex-1 justify-center">{navContent}</div>}

                            {iconLinks}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-6 flex-1 justify-start">
                                {menuStyle === "Drawer" && (
                                    <button
                                        onClick={() => setMobileMenuOpen(true)}
                                        aria-label="Open menu"
                                        className="transition-colors hover:opacity-70 block"
                                    >
                                        <span className="material-symbols-outlined text-2xl">menu</span>
                                    </button>
                                )}
                                {menuStyle === "Tabs" && navContent}
                            </div>

                            <div className="flex items-center justify-center flex-1">{logoContent}</div>

                            <div className="flex-1 flex justify-end">{iconLinks}</div>
                        </>
                    )}
                </div>
            </header>

            {/* Drawer menu — the reference (a static design tool) only shows the
                hamburger icon as a mock; this is a real storefront, so "Menu
                Style: Drawer" has to actually open something. */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-[60]"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] flex flex-col shadow-xl"
                        >
                            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                                <span className="font-black tracking-tighter text-xl">{logoText}</span>
                                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="hover:opacity-70">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            <nav className="flex flex-col p-5 gap-4 text-sm font-semibold tracking-wide uppercase">
                                {navItems.map((item) => (
                                    <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="opacity-80 hover:opacity-100">
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
