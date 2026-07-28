"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SearchOverlay from "./SearchOverlay";
import AuthModal from "@/components/shared/AuthModal";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAppSelector } from "@/redux/hooks";
import "./BottomNav.css";

interface BottomNavProps {
    shopName?: string;
    storeId?: string;
}

export default function BottomNav({ shopName, storeId }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const isHomePage = pathname === "/";

    const { scrollDirection, isAtTop } = useScrollDirection();
    const { isAuthenticated, cart } = useAppSelector((state) => state.user);
    const cartItemCount = cart?.itemCount ?? 0;

    const handleAccountClick = () => {
        if (isAuthenticated) {
            router.push("/accounts");
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const isActive = (path: string) => pathname === path;

    const isHiddenState = isHomePage ? isAtTop || scrollDirection === "up" : false;
    const bottomNavTranslateY = isHiddenState ? "100%" : "0";
    const bottomNavStyle = {
        transform: `translateY(${bottomNavTranslateY})`,
        transition: "transform 250ms ease-in-out",
    };

    return (
        <>
            <nav className="bottom-nav" id="bottom-nav" style={bottomNavStyle}>
                <button
                    className={`bottom-nav__item ${isActive("/") ? "bottom-nav__item--active" : ""}`}
                    onClick={() => router.push("/")}
                    aria-label="Home"
                >
                    <svg
                        className="bottom-nav__icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                    <span className="bottom-nav__label">Home</span>
                </button>

                <button className="bottom-nav__item" onClick={() => setIsSearchOpen(true)} aria-label="Search">
                    <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="bottom-nav__label">Search</span>
                </button>

                <button
                    className={`bottom-nav__item bottom-nav__item--center ${isActive("/products") ? "bottom-nav__item--active" : ""}`}
                    onClick={() => router.push("/products")}
                    aria-label="Menu"
                >
                    <span className="bottom-nav__menu-text">SHOP</span>
                </button>

                <button
                    className={`bottom-nav__item ${isActive("/accounts") ? "bottom-nav__item--active" : ""}`}
                    onClick={handleAccountClick}
                    aria-label="Account"
                >
                    <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    <span className="bottom-nav__label">Account</span>
                </button>

                <button
                    className={`bottom-nav__item ${isActive("/cart") ? "bottom-nav__item--active" : ""}`}
                    onClick={() => router.push("/cart")}
                    aria-label="Cart"
                >
                    <div className="bottom-nav__icon-wrapper">
                        <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartItemCount > 0 && <span className="bottom-nav__badge">{cartItemCount}</span>}
                    </div>
                    <span className="bottom-nav__label">Cart</span>
                </button>
            </nav>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                storeId={storeId}
                shopName={shopName}
                platformName="Fype"
            />
        </>
    );
}
