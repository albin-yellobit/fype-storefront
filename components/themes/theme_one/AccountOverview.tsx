"use client";

import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";

const cards = [
    { href: "/orders", icon: "shopping_bag", iconBg: "bg-blue-50", iconColor: "text-blue-600", title: "My Orders", description: "View and track your recent orders and returns." },
    { href: "/addresses", icon: "location_on", iconBg: "bg-green-50", iconColor: "text-green-600", title: "Addresses", description: "Manage your shipping and billing addresses." },
    { href: "/profile", icon: "person", iconBg: "bg-purple-50", iconColor: "text-purple-600", title: "Profile Details", description: "Update your personal information and contact details." },
];

export default function AccountOverview() {
    const { user } = useAppSelector((state) => state.user);

    return (
        <div className="space-y-8">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-blue-900 mb-2">Welcome back, {user?.firstName || "Guest"}!</h2>
                <p className="text-blue-700/80 text-lg">Manage your profile, orders, and addresses from your account dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card) => (
                    <Link key={card.href} href={card.href} className="block group">
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                            <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-3xl ${card.iconColor}`}>{card.icon}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                            <p className="text-gray-500 text-base leading-relaxed">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
