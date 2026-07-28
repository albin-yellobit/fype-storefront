"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { SwiperProps } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HeroSwiperProps {
    slides?: string[];
}

const defaultSlides = [
    "https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8MTYlM0E5fGVufDB8fDB8fHww&fm=jpg&q=60&w=3000",
];

export default function HeroSwiper({ slides }: HeroSwiperProps) {
    const heroSlides = slides && slides.length > 0 ? slides : defaultSlides;

    const swiperProps: SwiperProps = {
        modules: [Navigation, Pagination, Autoplay],
        navigation: false,
        pagination: { type: "bullets" },
        autoplay: { delay: 5000, disableOnInteraction: false },
        loop: heroSlides.length > 1,
    };

    return (
        <section className="w-full" style={{ aspectRatio: "1920/750" }}>
            <Swiper {...swiperProps} style={{ width: "100%", height: "100%" }}>
                {heroSlides.map((url, idx) => (
                    <SwiperSlide key={idx}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Hero slide ${idx + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
