"use client";

import { useRef, useEffect, useCallback } from "react";

interface ScrollingTextProps {
    text: string;
    speed?: number;
    className?: string;
}

/**
 * Flicker-free infinite scrolling text (marquee). Two identical sets sit
 * side-by-side; a CSS animation (see tokens.css `marquee-scroll`) translates
 * by -50% so the loop point is seamless. Duration is set via a CSS custom
 * property mutated directly on the DOM node, so React never re-renders to
 * update it.
 */
export default function ScrollingText({ text, speed = 50, className = "" }: ScrollingTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const singleSetRef = useRef<HTMLDivElement>(null);

    const recalculate = useCallback(() => {
        const track = trackRef.current;
        const singleSet = singleSetRef.current;
        if (!track || !singleSet) return;

        const setWidth = singleSet.scrollWidth;
        if (setWidth === 0) return;

        const duration = setWidth / speed;
        track.style.setProperty("--marquee-duration", `${duration}s`);
    }, [speed]);

    useEffect(() => {
        const rafId = requestAnimationFrame(recalculate);

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(recalculate);
        });
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [recalculate]);

    useEffect(() => {
        requestAnimationFrame(recalculate);
    }, [text, recalculate]);

    const repeatCount = 12;

    const renderSet = (keyPrefix: string) => (
        <div className="inline-flex items-center shrink-0" ref={keyPrefix === "a" ? singleSetRef : undefined}>
            {Array.from({ length: repeatCount }, (_, i) => (
                <span key={`${keyPrefix}-${i}`} className="inline-flex items-center px-8 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {text}
                </span>
            ))}
        </div>
    );

    return (
        <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
            <div
                ref={trackRef}
                className="inline-flex"
                style={{
                    animation: "marquee-scroll var(--marquee-duration, 20s) linear infinite",
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                }}
            >
                {renderSet("a")}
                {renderSet("b")}
            </div>
        </div>
    );
}
