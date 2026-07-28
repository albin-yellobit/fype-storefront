"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart, createOrder, type Address } from "@/redux/slices/userSlice";
import { calculateShippingRate, getExpectedTAT } from "@/lib/shipping-api";
import { fetchStockForCartItems } from "@/lib/stock-api";
import { useRazorpay } from "@/hooks/useRazorpay";
import AddressList from "@/components/themes/theme_one/AddressList";
import AuthModal from "@/components/shared/AuthModal";
import CheckoutSteps from "./CheckoutSteps";
import OrderSummary from "./OrderSummary";

type CheckoutStep = "address" | "review" | "payment";

interface CheckoutViewProps {
    storeId: string;
    shopName?: string;
    hasDeliveryApp: boolean;
    hasManualShipping: boolean;
    hasPaymentGateway: boolean;
}

const getCartHash = (items: { productId: string; variantId?: string; quantity: number }[]) =>
    [...items]
        .sort((a, b) => a.productId.localeCompare(b.productId))
        .map((i) => `${i.productId}:${i.variantId || ""}:${i.quantity}`)
        .join("|");

export default function CheckoutView({ storeId, shopName, hasDeliveryApp, hasManualShipping, hasPaymentGateway }: CheckoutViewProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated, cart } = useAppSelector((state) => state.user);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [tatInfo, setTatInfo] = useState<{ deliveryDate?: string } | null>(null);
    const [shipmentState, setShipmentState] = useState<{ serviceable: boolean; deliveryCharge: number | null; reason?: string }>({
        serviceable: true,
        deliveryCharge: null,
    });
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState<string | null>(null);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const lastCallRef = useRef<{ cartHash: string | null; pincode: string | null }>({ cartHash: null, pincode: null });

    const shippingCost = hasDeliveryApp || hasManualShipping ? (shipmentState.deliveryCharge ?? cart?.shipping ?? 0) : (cart?.shipping ?? 0);

    const { openRazorpay, isLoading: isPaymentLoading } = useRazorpay({
        storeId,
        storeName: shopName,
        onSuccess: async (paymentId, razorpayOrderId, razorpaySignature) => {
            await handleCreateOrder("razorpay", paymentId, razorpayOrderId, razorpaySignature);
        },
        onFailure: (error) => {
            console.error("Payment failed:", error);
            setOrderError(error instanceof Error ? error.message : "Payment failed. Please try again.");
        },
    });

    const fetchManualShippingRate = async () => {
        if (!cart?.items.length) return;
        const cartHash = getCartHash(cart.items);
        if (lastCallRef.current.cartHash === cartHash && lastCallRef.current.pincode === "manual") return;
        lastCallRef.current = { cartHash, pincode: "manual" };

        setIsCalculatingShipping(true);
        try {
            const rate = await calculateShippingRate(storeId, "", cart.items, "manual");
            if (rate) setShipmentState({ serviceable: rate.serviceable, deliveryCharge: rate.deliveryCharge, reason: rate.reason });
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const fetchShippingAndTAT = async () => {
        if (!selectedAddress || !cart?.items.length) return;
        const pincode = selectedAddress.postalCode;
        const cartHash = getCartHash(cart.items);
        if (lastCallRef.current.cartHash === cartHash && lastCallRef.current.pincode === pincode) return;

        if (!/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
            setShipmentState({ serviceable: false, deliveryCharge: null, reason: "invalid_pincode" });
            return;
        }
        lastCallRef.current = { cartHash, pincode };

        setIsCalculatingShipping(true);
        try {
            const [tatRes, rateRes] = await Promise.all([getExpectedTAT(storeId, pincode), calculateShippingRate(storeId, pincode, cart.items)]);
            if (tatRes.success) setTatInfo(tatRes);
            if (rateRes) {
                setShipmentState({ serviceable: rateRes.serviceable, deliveryCharge: rateRes.deliveryCharge, reason: rateRes.reason });
            } else {
                setShipmentState({ serviceable: false, deliveryCharge: null, reason: "rate_api_failed" });
            }
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    useEffect(() => {
        // Real network I/O (shipping-rate API) reacting to address/cart changes —
        // dedup'd via lastCallRef, not adjustable via the render-comparison pattern
        // used elsewhere in this codebase.
        if (hasDeliveryApp && selectedAddress && cart?.items.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchShippingAndTAT();
        } else if (hasManualShipping && cart?.items.length) {
            fetchManualShippingRate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasDeliveryApp, hasManualShipping, selectedAddress?.postalCode, cart?.items]);

    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address);
        setCurrentStep("review");
    };

    const handleCreateOrder = async (paymentMethod: "razorpay" | "manual", paymentId?: string, razorpayOrderId?: string, razorpaySignature?: string) => {
        if (!cart || !selectedAddress) return;

        setOrderError(null);
        setProcessingOrder(true);
        try {
            const order = await dispatch(
                createOrder({
                    storeId,
                    orderData: {
                        items: cart.items,
                        shippingAddress: selectedAddress,
                        billingAddress: selectedAddress,
                        paymentMethod,
                        customerNotes: "",
                        subtotal: cart.subtotal,
                        tax: cart.tax,
                        shipping: shippingCost,
                        total: (cart.subtotal || 0) + (cart.tax || 0) + shippingCost - (cart.discount || 0),
                        estimatedDelivery: tatInfo?.deliveryDate || null,
                        ...(paymentMethod === "razorpay" && razorpayOrderId && paymentId && razorpaySignature
                            ? { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: razorpaySignature }
                            : {}),
                    },
                })
            ).unwrap();

            await dispatch(clearCart({ storeId }));
            router.push(`/orders/${order.orderNumber}`);
        } catch (error) {
            console.error("Failed to create order:", error);
            setOrderError(typeof error === "string" ? error : "Order creation failed. Please contact support.");
        } finally {
            setProcessingOrder(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!cart?.items.length) return;
        setOrderError(null);

        // Re-validate stock right before payment/order creation
        try {
            const freshStock = await fetchStockForCartItems(storeId, cart.items);
            const hasIssue = cart.items.some((item) => {
                const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
                const available = freshStock[key];
                if (available === null || available === undefined) return false;
                return item.quantity > available;
            });
            if (hasIssue) {
                setOrderError("Some items have insufficient stock. Please update your cart.");
                return;
            }
        } catch {
            // Best-effort — if the stock check itself fails, proceed and let the backend be the source of truth
        }

        if (!hasPaymentGateway) {
            await handleCreateOrder("manual");
            return;
        }

        if (!user || !activePaymentMethod) return;
        const totalAmount = (cart.subtotal || 0) + (cart.tax || 0) + shippingCost - (cart.discount || 0);
        if (totalAmount <= 0) return;

        openRazorpay(
            totalAmount * 100,
            { name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer", email: user.email || "", phone: user.phone || "" },
            activePaymentMethod
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-lg text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">lock</span>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to checkout</h1>
                <p className="text-sm text-gray-500 mb-6">Please sign in to review your order and complete your purchase.</p>
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                    Sign In
                </button>
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} storeId={storeId} shopName={shopName} />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                <Link href="/products" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const total = (cart.subtotal || 0) + (cart.tax || 0) + shippingCost - (cart.discount || 0);
    const notServiceable = (hasDeliveryApp || hasManualShipping) && !shipmentState.serviceable;

    return (
        <div className="container mx-auto px-4 py-8">
            <CheckoutSteps currentStep={currentStep} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="lg:col-span-2">
                    {currentStep === "address" && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <AddressList storeId={storeId} selectionMode selectedAddressId={selectedAddress?._id || selectedAddress?.addressId} onAddressSelect={handleAddressSelect} />
                        </div>
                    )}

                    {(currentStep === "review" || currentStep === "payment") && selectedAddress && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                                    <button onClick={() => setCurrentStep("address")} className="text-sm text-black underline">
                                        Change
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                                    <p className="font-medium text-gray-900">
                                        {selectedAddress.firstName} {selectedAddress.lastName}
                                    </p>
                                    <p>{selectedAddress.addressLine1}</p>
                                    {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                                    <p>
                                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
                                    </p>
                                    <p className="text-gray-500 mt-1">📞 {selectedAddress.phoneNumber}</p>
                                </div>
                                {notServiceable && (
                                    <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                                        <p className="text-xs text-red-600 font-medium">This pincode is not serviceable. Please change your delivery address.</p>
                                    </div>
                                )}
                            </div>

                            {currentStep === "review" && (
                                <button
                                    onClick={() => setCurrentStep("payment")}
                                    disabled={notServiceable || isCalculatingShipping}
                                    className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCalculatingShipping ? "Calculating shipping..." : notServiceable ? "Not Serviceable" : "Proceed to Payment"}
                                </button>
                            )}

                            {currentStep === "payment" && (
                                <div className="space-y-4">
                                    {orderError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{orderError}</div>}

                                    {hasPaymentGateway ? (
                                        <>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-center text-gray-500">Select Payment Method</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {(["upi", "card"] as const).map((method) => (
                                                    <button
                                                        key={method}
                                                        onClick={() => setActivePaymentMethod(method)}
                                                        className={`p-4 border-2 rounded-xl transition-all uppercase text-xs font-bold tracking-wider ${
                                                            activePaymentMethod === method ? "border-black bg-black text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"
                                                        }`}
                                                    >
                                                        {method}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={handlePlaceOrder}
                                                disabled={isPaymentLoading || processingOrder || !activePaymentMethod || notServiceable}
                                                className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isPaymentLoading || processingOrder
                                                    ? "Processing..."
                                                    : !activePaymentMethod
                                                      ? "Select Payment Method"
                                                      : `Pay ₹${total.toFixed(2)}`}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={processingOrder || notServiceable}
                                            className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingOrder ? "Placing Order..." : "Place Order"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <OrderSummary
                        items={cart.items}
                        subtotal={cart.subtotal}
                        tax={cart.tax}
                        shipping={hasDeliveryApp || hasManualShipping ? shipmentState.deliveryCharge : shippingCost}
                        total={cart.total}
                        shippingCalculating={isCalculatingShipping}
                    />
                </div>
            </div>
        </div>
    );
}
