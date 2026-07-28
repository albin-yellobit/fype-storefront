"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface ImageBannerProps {
    imageUrl: string;
    subheading?: string;
    heading: string;
    buttonLabel?: string;
    buttonLink?: string;
}

// Trimmed port of Fype-E-Commerce-UI's sections/ImageBanner.tsx (read-only
// design reference) — the reference's image drag-to-reposition and
// block-selection props are editor-only concerns (for the future
// customization UI in ecommerce_app), not needed for customer-facing
// storefront rendering, so they're dropped here. Kept the fade-in animation
// as it's part of Spark's actual visual identity, not editor tooling.
export default function ImageBanner({ imageUrl, subheading, heading, buttonLabel, buttonLink }: ImageBannerProps) {
    return (
        <section className="relative w-full min-h-[750px] lg:min-h-[850px] flex items-center justify-center overflow-hidden bg-gray-50">
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 max-w-4xl px-6 flex flex-col items-center gap-6 text-center"
            >
                {subheading && (
                    <span className="tracking-[0.2em] text-white/90 text-xs sm:text-sm font-semibold uppercase">{subheading}</span>
                )}
                <h1 className="font-medium tracking-tight text-white leading-tight text-6xl md:text-[6rem]">{heading}</h1>
                {buttonLabel && (
                    <Link
                        href={buttonLink ?? "/products"}
                        className="px-8 py-3.5 bg-transparent border border-white text-white font-medium rounded-full hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs"
                    >
                        {buttonLabel}
                    </Link>
                )}
            </motion.div>
        </section>
    );
}
