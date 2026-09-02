"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export default function RequireCustomerAuth({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, authChecked } = useAppSelector((state) => state.user);

    useEffect(() => {
        if (authChecked && !isAuthenticated) {
            router.replace("/");
        }
    }, [authChecked, isAuthenticated, router]);

    if (!authChecked) {
        return (
            <div className="flex-grow flex items-center justify-center py-24">
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
