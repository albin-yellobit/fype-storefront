"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slices/userSlice";

interface AccountSidebarProps {
    storeId?: string;
}

const menuItems = [
    { icon: "dashboard", path: "/accounts", label: "Overview" },
    { icon: "person", path: "/profile", label: "Profile" },
    { icon: "shopping_bag", path: "/orders", label: "Orders" },
    { icon: "favorite", path: "/wishlist", label: "Wishlist" },
    { icon: "location_on", path: "/addresses", label: "Addresses" },
];

export default function AccountSidebar({ storeId }: AccountSidebarProps) {
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
        <aside className="w-full">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 mb-6 px-4 uppercase tracking-widest">Account</h2>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                                isActive(item.path) ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    <div className="mt-8">
                        {!showLogoutConfirm ? (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center gap-4 px-4 py-3 w-full text-left text-red-500 rounded-xl text-[13px] font-semibold hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Logout
                            </button>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 rounded-full border border-gray-800 shadow-lg">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <div className="w-px h-4 bg-gray-700" />
                                <button onClick={confirmLogout} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
}
