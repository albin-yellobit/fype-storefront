"use client";

import { useState } from "react";
import { SparkCartContext } from "./SparkCartContext";
import CartDrawer from "./CartDrawer";

interface SparkCartShellProps {
    storeId?: string;
    children: React.ReactNode;
}

export default function SparkCartShell({ storeId, children }: SparkCartShellProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SparkCartContext.Provider
            value={{
                isOpen,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
            }}
        >
            {children}
            {storeId ? <CartDrawer storeId={storeId} isOpen={isOpen} onClose={() => setIsOpen(false)} /> : null}
        </SparkCartContext.Provider>
    );
}
