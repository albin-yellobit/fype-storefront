"use client";

import type { ReactNode } from "react";
import type { PaymentMethodId } from "./checkoutUtils";
import { formatInr } from "./checkoutUtils";
import { Building2, ChevronRight } from "lucide-react";

interface PaymentMethodListProps {
    total: number;
    selected: PaymentMethodId | null;
    onSelect: (method: PaymentMethodId) => void;
    showCod: boolean;
    variant: "desktop" | "mobile";
}

function UpiChips() {
    return (
        <div className="flex items-center gap-0.5">
            <div className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center border border-white -mr-2 relative z-20 shadow-sm">
                <span className="text-white text-[10px] font-bold">पे</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-100 -mr-2 relative z-10 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-3.5 h-3.5" alt="GPay" />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#00BAF2] flex items-center justify-center border border-white shadow-sm">
                <span className="text-white text-[10px] font-bold italic">P</span>
            </div>
        </div>
    );
}

export default function PaymentMethodList({ total, selected, onSelect, showCod, variant }: PaymentMethodListProps) {
    const methods: Array<{
        id: PaymentMethodId;
        title: string;
        subtitle: string;
        extra?: ReactNode;
        amount: number;
        amountHint?: string;
        hidden?: boolean;
    }> = [
        { id: "upi", title: "Pay via UPI", subtitle: "Use any registered UPI ID", extra: <UpiChips />, amount: total },
        {
            id: "card",
            title: "Debit/Credit cards",
            subtitle: "Visa, Mastercard, RuPay & more",
            extra: (
                <div className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    <span className="text-[10px] font-black text-[#1A1F71] italic">VISA</span>
                </div>
            ),
            amount: total,
        },
        {
            id: "netbanking",
            title: "Netbanking",
            subtitle: "Select from a list of banks",
            extra: (
                <div className="w-[22px] h-[22px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-3 h-3 text-gray-600" size={12} />
                </div>
            ),
            amount: total,
        },
        {
            id: "cod",
            title: "Cash on delivery",
            subtitle: "Pay with cash",
            amount: total,
            hidden: !showCod,
        },
    ];

    if (variant === "desktop") {
        return (
            <section className="hidden md:flex bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex-col gap-4 sm:gap-5 mt-5">
                <h2 className="text-[16px] sm:text-lg font-bold text-gray-800 tracking-tight">Payment Method</h2>
                <div className="flex flex-col gap-3.5">
                    {methods
                        .filter((m) => !m.hidden)
                        .map((method) => (
                            <label
                                key={method.id}
                                className={`rounded-[20px] border p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors shadow-sm ${selected === method.id ? "border-gray-900 bg-gray-50/50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-[15px] sm:text-[16px]">{method.title}</span>
                                        {method.extra}
                                    </div>
                                    <span className="text-gray-500 text-[13px] sm:text-sm font-medium">{method.subtitle}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <span className="font-semibold text-gray-900 text-[15px] sm:text-[16px]">{formatInr(method.amount)}</span>
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                                        {selected === method.id && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={selected === method.id}
                                        onChange={() => onSelect(method.id)}
                                        className="hidden"
                                    />
                                </div>
                            </label>
                        ))}
                </div>
            </section>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6 flex flex-col gap-3.5 bg-gray-50/50">
            {methods
                .filter((m) => !m.hidden)
                .map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onSelect(method.id)}
                        className={`bg-white rounded-[20px] border p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors shadow-sm text-left ${selected === method.id ? "border-gray-900" : "border-gray-200"}`}
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-[15px] sm:text-[16px]">{method.title}</span>
                                {method.extra}
                            </div>
                            <span className="text-gray-500 text-[13px] sm:text-sm font-medium">{method.subtitle}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="font-semibold text-gray-900 text-[15px] sm:text-[16px]">{formatInr(method.amount)}</span>
                            <ChevronRight className="w-[18px] h-[18px] text-gray-400" size={18} />
                        </div>
                    </button>
                ))}
        </div>
    );
}
