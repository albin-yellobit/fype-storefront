"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to track scroll direction with a ~10px threshold to prevent jitter.
 */
export const useScrollDirection = () => {
    const [scrollDirection, setScrollDirection] = useState<"up" | "down" | "rest">("rest");
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollDirection = () => {
            const scrollY = window.scrollY;

            // ~10px movement threshold
            if (Math.abs(scrollY - lastScrollY) < 10) {
                ticking = false;
                return;
            }

            setScrollDirection(scrollY > lastScrollY ? "down" : "up");
            setIsAtTop(scrollY < 10);
            lastScrollY = scrollY > 0 ? scrollY : 0;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return { scrollDirection, isAtTop };
};

export default useScrollDirection;
