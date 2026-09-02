"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CheckoutHeader({ title, backHref, onBack }: { title: string; backHref?: string; onBack?: () => void }) {
    const backButtonClass = "p-1 -ml-1 text-black hover:bg-gray-100 rounded-full transition-colors";

    return (
        <header className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-4 bg-white sticky top-0 z-10">
            {onBack ? (
                <button type="button" onClick={onBack} className={backButtonClass} aria-label="Back">
                    <ChevronLeft className="w-6 h-6" size={24} />
                </button>
            ) : (
                <Link href={backHref || "/cart"} className={backButtonClass} aria-label="Back to cart">
                    <ChevronLeft className="w-6 h-6" size={24} />
                </Link>
            )}
            <h1 className="text-[17px] sm:text-[19px] font-semibold text-black tracking-tight">{title}</h1>
        </header>
    );
}
