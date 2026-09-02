"use client";

import { createContext, useContext } from "react";
import type { Cart } from "@/redux/slices/userSlice";

type SparkCartContextValue = {
    openCart: () => void;
    closeCart: () => void;
    isOpen: boolean;
};

export const SparkCartContext = createContext<SparkCartContextValue>({
    openCart: () => {},
    closeCart: () => {},
    isOpen: false,
});

export function useSparkCart() {
    return useContext(SparkCartContext);
}

/** Same sum as Fype-E-Commerce-UI SparkTheme `cartTotalCount`. */
export function cartTotalCount(cart: Cart | null | undefined): number {
    if (!cart) return 0;
    if (cart.items?.length) return cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
    return cart.itemCount || 0;
}
