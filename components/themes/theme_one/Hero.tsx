"use client";

import dynamic from "next/dynamic";
import { HeroShimmer } from "./Shimmer";

// Swiper touches the DOM at construction time and isn't SSR-safe — load client-only.
const HeroSwiper = dynamic(() => import("./HeroSwiper"), {
    ssr: false,
    loading: () => <HeroShimmer />,
});

interface HeroProps {
    slides?: string[];
}

export default function Hero({ slides }: HeroProps) {
    return <HeroSwiper slides={slides} />;
}
