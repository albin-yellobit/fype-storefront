"use client";

import { ShieldCheck } from "lucide-react";

export default function SecuredByFype() {
    return (
        <div className="flex items-center justify-center mt-4 text-gray-500">
            <ShieldCheck className="w-4 h-4 text-gray-400 mr-1.5" size={16} />
            <span className="text-[12px] font-medium">Secured by</span>
            <div className="relative w-[64px] h-4 flex items-center justify-center ml-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/checkout/securedbyfype.svg"
                    alt="Fype"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[51%] h-[80px] w-[80px] max-w-none object-contain pointer-events-none"
                />
            </div>
        </div>
    );
}
