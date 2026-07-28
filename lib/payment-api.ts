import { getAuthToken, postApi } from "./client-api";
import type { ApiResponse } from "@/types/api";

export interface RazorpayOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    status?: string;
    receipt?: string;
}

interface PaymentVerificationResponse {
    verified: boolean;
    orderId?: string;
}

export async function createRazorpayOrder(storeId: string, amount: number): Promise<RazorpayOrderResponse | null> {
    if (!getAuthToken()) {
        console.warn("[payment-api] User not authenticated, cannot initiate payment");
        return null;
    }

    try {
        const response = await postApi<ApiResponse<RazorpayOrderResponse>>(`/commerce/${storeId}/orders/payment/order?provider=razorpay`, {
            amount,
        });

        if (response.data.success) return response.data.data;
        return null;
    } catch (error) {
        console.error("Failed to create Razorpay order:", error);
        return null;
    }
}

export async function verifyPayment(
    storeId: string,
    paymentDetails: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
): Promise<PaymentVerificationResponse | null> {
    try {
        const response = await postApi<ApiResponse<PaymentVerificationResponse>>(
            `/commerce/${storeId}/orders/payment/verify?provider=razorpay`,
            paymentDetails
        );

        if (response.data.success) return response.data.data;
        return null;
    } catch (error) {
        console.error("Payment verification failed:", error);
        return null;
    }
}
