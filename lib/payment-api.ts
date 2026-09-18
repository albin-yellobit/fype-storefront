import { getAuthToken, postApi } from "./client-api";
import type { ApiResponse } from "@/types/api";

export interface GatewayOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    status?: string;
    receipt?: string;
    // Gateway-specific client-side config, spread directly from the backend's
    // clientConfig passthrough (see crmApp payment.controller.ts) - keyId for
    // Razorpay, publishableKey+clientSecret for Stripe. Every field is
    // optional here since which ones exist depends entirely on which gateway
    // responded.
    keyId?: string;
    publishableKey?: string;
    clientSecret?: string;
}

interface PaymentVerificationResponse {
    verified: boolean;
    orderId?: string;
}

/**
 * Pre-order creation for any registered gateway (crmApp's payment.controller.ts
 * dispatches ?provider=<key> through its PaymentGateway registry). Replaces the
 * old Razorpay-only createRazorpayOrder - same auth guard, same error handling.
 */
export async function createGatewayOrder(storeId: string, provider: string, amount: number): Promise<GatewayOrderResponse | null> {
    if (!getAuthToken()) {
        console.warn("[payment-api] User not authenticated, cannot initiate payment");
        return null;
    }

    try {
        const response = await postApi<ApiResponse<GatewayOrderResponse>>(`/commerce/${storeId}/orders/payment/order?provider=${provider}`, {
            amount,
        });

        if (response.data.success) return response.data.data;
        return null;
    } catch (error) {
        console.error(`Failed to create ${provider} order:`, error);
        return null;
    }
}

/**
 * Payment verification for any registered gateway. `paymentDetails` shape is
 * gateway-specific (Razorpay: razorpay_order_id/payment_id/signature; Stripe:
 * paymentIntentId) - passed through as-is to the backend, which dispatches it
 * to the matching gateway's verifyPayment().
 */
export async function verifyGatewayPayment(
    storeId: string,
    provider: string,
    paymentDetails: Record<string, unknown>
): Promise<PaymentVerificationResponse | null> {
    try {
        const response = await postApi<ApiResponse<PaymentVerificationResponse>>(
            `/commerce/${storeId}/orders/payment/verify?provider=${provider}`,
            paymentDetails
        );

        if (response.data.success) return response.data.data;
        return null;
    } catch (error) {
        console.error(`${provider} payment verification failed:`, error);
        return null;
    }
}
