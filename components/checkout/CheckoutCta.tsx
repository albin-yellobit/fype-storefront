"use client";

import SecuredByFype from "./SecuredByFype";

interface CheckoutCtaProps {
    label: string;
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
    boxed?: boolean;
}

export default function CheckoutCta({ label, disabled, loading, onClick, boxed }: CheckoutCtaProps) {
    const button = (
        <button
            type="button"
            disabled={disabled || loading}
            onClick={onClick}
            className={`w-full py-[14px] sm:py-4 rounded-xl font-bold text-[16px] sm:text-lg flex items-center justify-center gap-2 transition-all ${
                disabled || loading
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 active:scale-[0.98]"
            }`}
        >
            {loading ? "Processing..." : label}
        </button>
    );

    if (boxed) {
        return (
            <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                {button}
                <SecuredByFype />
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-5 bg-white border-t border-gray-100 pb-6 sm:pb-5 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] mt-auto shrink-0 z-10 md:hidden">
            {button}
            <SecuredByFype />
        </div>
    );
}
