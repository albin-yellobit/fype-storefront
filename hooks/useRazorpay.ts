"use client";

import { useState, useCallback, useEffect } from "react";
import { createRazorpayOrder, verifyPayment } from "@/lib/payment-api";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

interface UseRazorpayOptions {
    storeId: string;
    storeName?: string;
    onSuccess: (paymentId: string, orderId: string, razorpaySignature?: string) => void;
    onFailure: (error: unknown) => void;
}

// The `https://checkout.razorpay.com/v1/checkout.js` script itself is loaded by
// the checkout page via next/script (strategy="lazyOnload") — this hook just
// waits for `window.Razorpay` to show up rather than injecting its own script tag.
export function useRazorpay({ storeId, storeName, onSuccess, onFailure }: UseRazorpayOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(() => typeof window !== "undefined" && !!window.Razorpay);

    useEffect(() => {
        if (isReady) return;

        const interval = setInterval(() => {
            if (typeof window !== "undefined" && window.Razorpay) {
                setIsReady(true);
                clearInterval(interval);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isReady]);

    const openRazorpay = useCallback(
        async (amount: number, userDetails: { name: string; email?: string; phone: string }, method?: string) => {
            if (!isReady) {
                onFailure(new Error("Razorpay SDK not loaded"));
                return;
            }

            setIsLoading(true);

            try {
                const orderData = await createRazorpayOrder(storeId, amount);
                if (!orderData) {
                    throw new Error("Failed to create payment order");
                }

                const options = {
                    key: orderData.keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: storeName || "My Store",
                    description: "Order Payment",
                    order_id: orderData.orderId,
                    prefill: {
                        name: userDetails.name,
                        email: userDetails.email || "",
                        contact: userDetails.phone,
                        method,
                    },
                    theme: { color: "#000000" },
                    handler: async function (response: {
                        razorpay_order_id: string;
                        razorpay_payment_id: string;
                        razorpay_signature: string;
                    }) {
                        try {
                            const verification = await verifyPayment(storeId, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            if (verification && verification.verified) {
                                onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
                            } else {
                                throw new Error("Payment verification failed");
                            }
                        } catch (error) {
                            onFailure(error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setIsLoading(false);
                            onFailure(new Error("Payment cancelled"));
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                setIsLoading(false);
                onFailure(error);
            }
        },
        [isReady, storeId, storeName, onSuccess, onFailure]
    );

    return { openRazorpay, isLoading, isReady };
}
