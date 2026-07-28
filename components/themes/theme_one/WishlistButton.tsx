"use client";

import { useState } from "react";
import AuthModal from "@/components/shared/AuthModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToWishlist, removeFromWishlist } from "@/redux/slices/userSlice";

interface WishlistButtonProps {
    productId: string;
    storeId?: string;
    shopName?: string;
}

export default function WishlistButton({ productId, storeId, shopName }: WishlistButtonProps) {
    const dispatch = useAppDispatch();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const { isAuthenticated, wishlist } = useAppSelector((state) => state.user);
    const isWishlisted = wishlist.includes(productId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            return;
        }
        if (!storeId) return;

        if (isWishlisted) {
            dispatch(removeFromWishlist({ storeId, productId }));
        } else {
            dispatch(addToWishlist({ storeId, productId }));
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="absolute top-2 right-2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill={isWishlisted ? "#000000" : "none"}
                    viewBox="0 0 24 24"
                    stroke={isWishlisted ? "#000000" : "#666666"}
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} storeId={storeId} shopName={shopName} platformName="Fype" />
        </>
    );
}
