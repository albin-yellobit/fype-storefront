"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slices/userSlice";

interface SparkAccountSidebarProps {
    storeId?: string;
}

const menuItems = [
    { path: "/accounts", label: "Overview" },
    { path: "/orders", label: "Orders" },
    { path: "/wishlist", label: "Wishlist" },
    { path: "/addresses", label: "Addresses" },
];

// Internal to Spark's AccountLayout only — not part of ThemeModule's shape
// (theme_one's own AccountSidebar is only ever used by theme_one's own
// AccountLayout), so no prop-signature compatibility constraint here, unlike
// AccountLayout/WishlistView which DO override real ThemeModule fields and
// must match theme_one's exact prop shape.
export default function AccountSidebar({ storeId }: SparkAccountSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const isActive = (path: string) => pathname === path;

    const confirmLogout = () => {
        if (storeId) dispatch(logout({ storeId }));
        router.push("/");
    };

    return (
        <nav className="flex flex-row md:flex-col gap-1 p-1 md:p-0 bg-gray-50 md:bg-transparent rounded-xl md:rounded-none border border-gray-100 md:border-0 mb-4 md:mb-0">
            {menuItems.map((item) => (
                <Link
                    key={item.path}
                    href={item.path}
                    className={`flex-1 md:flex-initial text-center md:text-left px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive(item.path) ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    }`}
                >
                    {item.label}
                </Link>
            ))}

            <div className="hidden md:block mt-6">
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-2 px-4 py-3 w-full text-left text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                        Sign out
                    </button>
                ) : (
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 rounded-full">
                        <button onClick={() => setShowLogoutConfirm(false)} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button onClick={confirmLogout} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
