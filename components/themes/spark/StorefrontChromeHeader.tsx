"use client";

import SparkHeaderShell from "./SparkHeaderShell";
import { sparkConfigFromStorefrontChrome } from "./storefrontChromeConfig";
import type { FooterCustomization, NavbarCustomization } from "@/types/storefront";

interface NavItem {
    label: string;
    href: string;
}

interface StorefrontChromeHeaderProps {
    variant?: "default" | "products";
    scrollingText?: string;
    scorllEnabled?: boolean;
    shopName?: string;
    navbar?: NavbarCustomization;
    footer?: FooterCustomization;
    navItems: NavItem[];
    storeId?: string;
    themeConfig?: Record<string, unknown>;
}

export default function StorefrontChromeHeader({ shopName, navbar, navItems, storeId, themeConfig }: StorefrontChromeHeaderProps) {
    const config = sparkConfigFromStorefrontChrome(shopName, navbar?.logoUrl, themeConfig);
    return (
        <SparkHeaderShell
            config={config}
            navItems={navItems}
            shop={{ shopId: storeId || "", shopName: shopName || "" }}
        />
    );
}
