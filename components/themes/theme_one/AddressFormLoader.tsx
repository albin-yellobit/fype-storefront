"use client";

import dynamic from "next/dynamic";
import type { Address } from "@/redux/slices/userSlice";

// Leaflet touches `window`/`document` at module load — not SSR-safe. Same
// pattern as Hero.tsx's swiper wrapper.
const AddressFormWithMap = dynamic(() => import("./AddressFormWithMap"), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
        </div>
    ),
});

interface AddressFormLoaderProps {
    initialAddress?: Address | null;
    onSubmit: (address: Omit<Address, "_id" | "addressId">) => Promise<void>;
    onCancel?: () => void;
    userProfile?: { firstName?: string; lastName?: string; email?: string; phone?: string };
}

export default function AddressFormLoader(props: AddressFormLoaderProps) {
    return <AddressFormWithMap {...props} />;
}
