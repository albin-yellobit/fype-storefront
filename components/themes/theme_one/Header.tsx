"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ScrollingText from "./ScrollingText";
import AuthModal from "@/components/shared/AuthModal";
import SearchOverlay from "./SearchOverlay";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/userSlice";
import type { FooterCustomization, NavbarCustomization } from "@/types/storefront";

export interface NavItem {
    label: string;
    href: string;
}

interface HeaderProps {
    variant?: "default" | "products";
    scrollingText?: string;
    scorllEnabled?: boolean;
    shopName?: string;
    navbar?: NavbarCustomization;
    footer?: FooterCustomization;
    navItems: NavItem[];
    storeId?: string;
}

const socialIconMap = {
    instagram: "/logos/instagram.png",
    facebook: "/logos/facebook.png",
    twitter: "/logos/twitter.png",
    linkedin: "/logos/linkedin.png",
} as const;

export default function Header({
    variant = "default",
    scrollingText,
    scorllEnabled,
    shopName,
    navbar,
    footer,
    navItems,
    storeId,
}: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { scrollDirection, isAtTop } = useScrollDirection();
    const isScrolled = !isAtTop;

    const { user, isAuthenticated, cart } = useAppSelector((state) => state.user);
    const cartItemCount = cart?.itemCount ?? 0;

    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isDrawerOpen]);

    const brandName = navbar?.title || shopName || "Store";

    const getSocialLinks = () => {
        const socialLinks = footer?.socialLinks;
        const links: { name: string; icon: string; url: string }[] = [];

        if (socialLinks?.instagram) links.push({ name: "Instagram", icon: socialIconMap.instagram, url: socialLinks.instagram });
        if (socialLinks?.facebook) links.push({ name: "Facebook", icon: socialIconMap.facebook, url: socialLinks.facebook });
        if (socialLinks?.twitter) links.push({ name: "Twitter", icon: socialIconMap.twitter, url: socialLinks.twitter });
        if (socialLinks?.linkedin) links.push({ name: "LinkedIn", icon: socialIconMap.linkedin, url: socialLinks.linkedin });

        return links;
    };

    const socialLinks = getSocialLinks();

    const handleUserIconClick = () => {
        if (isAuthenticated) {
            router.push("/accounts");
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        if (storeId) dispatch(logout({ storeId }));
        router.push("/");
    };

    const renderNavbarBrand = (isMobile = false) => {
        const displayType = navbar?.displayType || "title";
        const textClass = isMobile ? "text-2xl" : "text-2xl";

        if (displayType === "logo" && navbar?.logoUrl) {
            return (
                <Link href="/">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={navbar.logoUrl}
                        alt={brandName}
                        className={`${isMobile ? "h-8 max-w-[150px]" : "h-10 max-w-[200px]"} object-contain`}
                    />
                </Link>
            );
        }

        if (displayType === "logo-title" && navbar?.logoUrl) {
            return (
                <Link href="/">
                    <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={navbar.logoUrl}
                            alt={brandName}
                            className={`${isMobile ? "h-6 max-w-[120px]" : "h-8 max-w-[150px]"} object-contain`}
                        />
                        <h2 className={`${textClass} font-bold text-black`}>{brandName}</h2>
                    </div>
                </Link>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <Link href="/">
                    <h2 className={`${textClass} font-bold`}>{brandName}</h2>
                </Link>
            </div>
        );
    };

    // Hide-on-scroll-down only applies on mobile — CSS media query (max-md:), not a JS width check.
    const hideOnScroll = scrollDirection === "down" && !isAtTop;
    const headerTransitionClass = "transition-transform duration-[250ms] ease-in-out";
    const headerHideClass = hideOnScroll ? "max-md:-translate-y-full" : "";

    const isHidden = variant === "default" && pathname !== "/" ? "max-md:hidden" : "";

    return (
        <div className={isHidden}>
            {variant === "products" ? (
                <header
                    className={`sticky top-0 z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-background-light px-4 sm:px-6 lg:px-8 py-3 ${headerTransitionClass} ${headerHideClass}`}
                >
                    <button className="p-2 text-black">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    {renderNavbarBrand()}
                    <div className="flex gap-2">
                        <button className="p-2" onClick={() => setIsSearchOpen(true)}>
                            <span className="material-symbols-outlined text-[#333333]">search</span>
                        </button>
                        <button className="p-2" onClick={handleUserIconClick}>
                            <span className="material-symbols-outlined text-[#333333]">person</span>
                        </button>
                        <button onClick={() => router.push("/cart")} className="p-2 relative">
                            <span className="material-symbols-outlined text-[#333333]">shopping_cart</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>
            ) : (
                <>
                    {scorllEnabled && scrollingText && (
                        <div
                            className={`fixed top-0 left-0 right-0 z-50 bg-background-dark text-green-400 overflow-hidden transition-all duration-300 ${
                                isScrolled ? "h-0 opacity-0" : "h-10 opacity-100"
                            }`}
                        >
                            <div className="h-full flex items-center">
                                <ScrollingText text={scrollingText} speed={200} />
                            </div>
                        </div>
                    )}

                    <header
                        className={`sticky z-40 flex items-center justify-between border-b border-black/10 bg-background-light/80 px-4 sm:px-6 lg:px-8 backdrop-blur-sm transition-all duration-300 ${headerTransitionClass} ${headerHideClass} ${
                            scorllEnabled && scrollingText && !isScrolled ? "top-10 h-16" : "top-0 h-16"
                        }`}
                    >
                        <button
                            className="p-2 text-black transition-opacity hover:opacity-70"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>

                        {renderNavbarBrand()}

                        <div className="flex items-center gap-1">
                            <button
                                className="p-3 rounded-full hover:bg-black/5 transition-colors text-black"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <span className="material-symbols-outlined">search</span>
                            </button>

                            <div className="relative">
                                <button
                                    className="p-3 rounded-full hover:bg-black/5 transition-colors text-black"
                                    onClick={handleUserIconClick}
                                >
                                    <span className="material-symbols-outlined">person</span>
                                </button>

                                {isAuthenticated && isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">{user?.firstName || "User"}</p>
                                            <p className="text-xs text-gray-500">{user?.phone}</p>
                                        </div>
                                        <Link
                                            href="/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/wishlist"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Wishlist
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => router.push("/cart")}
                                className="p-3 rounded-full hover:bg-black/5 transition-colors relative text-black"
                            >
                                <span className="material-symbols-outlined">shopping_bag</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </header>

                    <div
                        className={`fixed inset-0 z-50 transition-all duration-300 ${
                            isDrawerOpen ? "bg-black/50 pointer-events-auto" : "bg-black/0 pointer-events-none"
                        }`}
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <div
                            className={`fixed top-0 left-0 h-full w-80 bg-background-light shadow-xl transition-transform duration-300 ${
                                isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                {renderNavbarBrand(true)}
                                <button className="p-2 rounded-full hover:bg-black/5" onClick={() => setIsDrawerOpen(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {isAuthenticated && user && (
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-blue-600">person</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.firstName || "User"}</p>
                                            <p className="text-sm text-gray-500">{user?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className="p-6">
                                <ul className="space-y-4">
                                    {navItems.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="block py-3 text-lg font-medium hover:text-primary transition-colors border-b border-gray-100"
                                                onClick={() => setIsDrawerOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}

                                    {isAuthenticated ? (
                                        <>
                                            <li>
                                                <Link
                                                    href="/account"
                                                    className="block py-3 text-lg font-medium hover:text-primary transition-colors border-b border-gray-100"
                                                    onClick={() => setIsDrawerOpen(false)}
                                                >
                                                    My Account
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/orders"
                                                    className="block py-3 text-lg font-medium hover:text-primary transition-colors border-b border-gray-100"
                                                    onClick={() => setIsDrawerOpen(false)}
                                                >
                                                    My Orders
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsDrawerOpen(false);
                                                    }}
                                                    className="block w-full text-left py-3 text-lg font-medium text-red-600 hover:text-red-700 transition-colors border-b border-gray-100"
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setIsDrawerOpen(false);
                                                    setIsAuthModalOpen(true);
                                                }}
                                                className="block w-full text-left py-3 text-lg font-medium text-blue-600 hover:text-blue-700 transition-colors border-b border-gray-100"
                                            >
                                                Sign In
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </nav>

                            {socialLinks.length > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                                    <p className="text-sm font-medium text-gray-600 mb-4">Follow Us</p>
                                    <div className="flex gap-4 flex-wrap">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={social.icon} alt={social.name} className="w-5 h-5 object-contain" />
                                                <span>{social.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                storeId={storeId}
                shopName={brandName}
                platformName="Fype"
            />
        </div>
    );
}
