"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    addAddress,
    clearCart,
    createOrder,
    deleteAddress,
    fetchAddresses,
    removeFromCart,
    updateAddress,
    updateCartItem,
    type Address,
    type CartItem,
} from "@/redux/slices/userSlice";
import { calculateShippingRate, getExpectedTAT } from "@/lib/shipping-api";
import { fetchStockForCartItems } from "@/lib/stock-api";
import { useRazorpay } from "@/hooks/useRazorpay";
import AuthModal from "@/components/shared/AuthModal";
import AddAddressPanel from "./AddAddressPanel";
import CartItemsCard from "./CartItemsCard";
import CheckoutCta from "./CheckoutCta";
import CheckoutHeader from "./CheckoutHeader";
import DeliveryAddressCard from "./DeliveryAddressCard";
import PaymentMethodList from "./PaymentMethodList";
import PaymentSummaryCard from "./PaymentSummaryCard";
import SelectAddressPanel from "./SelectAddressPanel";
import { addressKey, type CheckoutViewState, type PaymentMethodId } from "./checkoutUtils";

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
    const { user, isAuthenticated, cart, addresses } = useAppSelector((state) => state.user);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [view, setView] = useState<CheckoutViewState>("checkout");
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [savingAddress, setSavingAddress] = useState(false);
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId | null>(null);
    const [tatInfo, setTatInfo] = useState<{ deliveryDate?: string } | null>(null);
    const [shipmentState, setShipmentState] = useState<{ serviceable: boolean; deliveryCharge: number | null; reason?: string }>({
        serviceable: true,
        deliveryCharge: null,
    });
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [processingOrder, setProcessingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [prevAddresses, setPrevAddresses] = useState(addresses);
    const lastCallRef = useRef<{ cartHash: string | null; pincode: string | null }>({ cartHash: null, pincode: null });

    const shippingCost = hasDeliveryApp || hasManualShipping ? (shipmentState.deliveryCharge ?? cart?.shipping ?? 0) : (cart?.shipping ?? 0);
    const showCod = !hasPaymentGateway;
    const notServiceable = (hasDeliveryApp || hasManualShipping) && !shipmentState.serviceable;

    useEffect(() => {
        if (showCod) setSelectedPaymentMethod("cod");
    }, [showCod]);

    const { openRazorpay, isLoading: isPaymentLoading } = useRazorpay({
        storeId,
        storeName: shopName,
        onSuccess: async (paymentId, razorpayOrderId, razorpaySignature) => {
            await handleCreateOrder("razorpay", paymentId, razorpayOrderId, razorpaySignature);
        },
        onFailure: (error) => {
            setOrderError(error instanceof Error ? error.message : "Payment failed. Please try again.");
        },
    });

    useEffect(() => {
        if (isAuthenticated && storeId) dispatch(fetchAddresses({ storeId }));
    }, [dispatch, isAuthenticated, storeId]);

    if (addresses !== prevAddresses) {
        setPrevAddresses(addresses);
        if (addresses.length === 0) {
            setSelectedAddress(null);
        } else if (!selectedAddress || !addresses.some((a) => addressKey(a) === addressKey(selectedAddress))) {
            const preferred = addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddress(preferred);
        }
    }

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
            if (rateRes) setShipmentState({ serviceable: rateRes.serviceable, deliveryCharge: rateRes.deliveryCharge, reason: rateRes.reason });
            else setShipmentState({ serviceable: false, deliveryCharge: null, reason: "rate_api_failed" });
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    useEffect(() => {
        if (hasDeliveryApp && selectedAddress && cart?.items.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchShippingAndTAT();
        } else if (hasManualShipping && cart?.items.length) {
            fetchManualShippingRate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasDeliveryApp, hasManualShipping, selectedAddress?.postalCode, cart?.items]);

    const handleCreateOrder = async (
        paymentMethod: "razorpay" | "manual",
        paymentId?: string,
        razorpayOrderId?: string,
        razorpaySignature?: string
    ) => {
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
            setOrderError(typeof error === "string" ? error : "Order creation failed. Please contact support.");
        } finally {
            setProcessingOrder(false);
        }
    };

    const handlePlaceOrder = async (method: PaymentMethodId | null = selectedPaymentMethod) => {
        if (!cart?.items.length || !selectedAddress) return;
        setOrderError(null);

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
            // Backend is source of truth if the pre-check fails
        }

        if (!hasPaymentGateway || method === "cod") {
            await handleCreateOrder("manual");
            return;
        }

        if (!user || !method) return;
        const totalAmount = (cart.subtotal || 0) + (cart.tax || 0) + shippingCost - (cart.discount || 0);
        if (totalAmount <= 0) return;

        openRazorpay(
            totalAmount * 100,
            { name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer", email: user.email || "", phone: user.phone || "" },
            method
        );
    };

    const handleUpdateQuantity = (item: CartItem, quantity: number) => {
        dispatch(updateCartItem({ storeId, itemId: item._id, variantId: item.variantId, quantity }));
    };

    const handleRemove = (item: CartItem) => {
        dispatch(removeFromCart({ storeId, itemId: item._id, variantId: item.variantId }));
    };

    const handleSaveAddress = async (payload: Omit<Address, "_id" | "addressId">) => {
        setSavingAddress(true);
        try {
            if (editingAddress) {
                const updated = await dispatch(
                    updateAddress({ storeId, addressId: editingAddress.addressId, address: payload })
                ).unwrap();
                setSelectedAddress(updated);
            } else {
                const created = await dispatch(addAddress({ storeId, address: payload })).unwrap();
                setSelectedAddress(created);
            }
            setEditingAddress(null);
            setView("checkout");
        } finally {
            setSavingAddress(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!addressToDelete) return;
        await dispatch(deleteAddress({ storeId, addressId: addressToDelete }));
        if (selectedAddress && addressKey(selectedAddress) === addressToDelete) {
            const remaining = addresses.filter((a) => addressKey(a) !== addressToDelete);
            setSelectedAddress(remaining[0] || null);
        }
        setAddressToDelete(null);
    };

    const renderPanel = (panel: ReactNode, isModal: boolean) => {
        if (isModal) {
            return (
                <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-[500px] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden relative">
                        {panel}
                    </div>
                </div>
            );
        }
        return (
            <div className="md:hidden min-h-[100dvh] h-[100dvh] bg-gray-100 flex justify-center font-sans">
                <div className="w-full max-w-md bg-white flex flex-col relative mx-auto">{panel}</div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[100dvh] bg-gray-100 flex items-center justify-center font-sans px-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to checkout</h1>
                    <p className="text-sm text-gray-500 mb-6">Please sign in to review your order and complete your purchase.</p>
                    <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all"
                    >
                        Sign In
                    </button>
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} storeId={storeId} shopName={shopName} />
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-[100dvh] bg-gray-100 flex flex-col font-sans">
                <div className="w-full max-w-md mx-auto bg-white min-h-[100dvh] md:min-h-0 md:mt-8 md:rounded-2xl md:border md:border-gray-200 overflow-hidden">
                    <CheckoutHeader title="Checkout" backHref="/cart" />
                    <div className="p-8 text-center">
                        <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                        <Link href="/products" className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const total = (cart.subtotal || 0) + (cart.tax || 0) + shippingCost - (cart.discount || 0);
    const shippingDisplay = hasDeliveryApp || hasManualShipping ? shipmentState.deliveryCharge : shippingCost;
    const ctaDisabled = !selectedAddress || notServiceable || isCalculatingShipping || processingOrder || isPaymentLoading;
    const desktopPlaceDisabled = ctaDisabled || (!showCod && !selectedPaymentMethod);

    const checkoutMain = (
        <div className={`${view !== "checkout" ? "hidden md:flex" : "flex"} min-h-[100dvh] h-[100dvh] md:h-auto bg-gray-100 justify-center font-sans md:py-8 md:px-4`}>
            <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl flex md:gap-6 lg:gap-8 relative overflow-hidden md:overflow-visible mx-auto">
                <div className="w-full bg-white md:rounded-2xl h-full md:h-auto md:min-h-[600px] relative flex flex-col shadow-2xl md:shadow-sm md:border border-gray-200 overflow-hidden md:flex-1">
                    <CheckoutHeader title="Checkout" backHref="/cart" />

                    <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 flex flex-col gap-5 sm:gap-8 pb-4 sm:pb-6">
                        <div className="md:hidden">
                            <CartItemsCard
                                items={cart.items}
                                collapsible
                                isOpen={isOrderSummaryOpen}
                                onToggle={() => setIsOrderSummaryOpen((open) => !open)}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemove}
                            />
                        </div>
                        <CartItemsCard
                            items={cart.items}
                            className="hidden md:flex"
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemove}
                        />

                        <DeliveryAddressCard
                            addresses={addresses}
                            selected={selectedAddress}
                            onChange={() => setView("select-address")}
                            onAdd={() => {
                                setEditingAddress(null);
                                setView("add-address");
                            }}
                            notServiceable={notServiceable}
                            tatInfo={tatInfo?.deliveryDate}
                        />

                        {hasPaymentGateway ? (
                            <PaymentMethodList
                                total={total}
                                selected={selectedPaymentMethod}
                                onSelect={setSelectedPaymentMethod}
                                showCod={showCod}
                                variant="desktop"
                            />
                        ) : (
                            <PaymentMethodList
                                total={total}
                                selected={selectedPaymentMethod ?? "cod"}
                                onSelect={setSelectedPaymentMethod}
                                showCod
                                variant="desktop"
                            />
                        )}

                        {orderError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{orderError}</div>}
                    </div>

                    <CheckoutCta
                        label={addresses.length === 0 ? "Add address" : "Proceed to pay"}
                        disabled={addresses.length === 0 ? false : ctaDisabled}
                        loading={processingOrder || isPaymentLoading}
                        onClick={() => {
                            if (addresses.length === 0) {
                                setEditingAddress(null);
                                setView("add-address");
                                return;
                            }
                            if (!hasPaymentGateway) {
                                setSelectedPaymentMethod("cod");
                                setView("payment-methods");
                                return;
                            }
                            setView("payment-methods");
                        }}
                    />
                </div>

                <div className="hidden md:block w-[320px] lg:w-[400px] shrink-0">
                    <div className="sticky top-8 flex flex-col gap-4">
                        <PaymentSummaryCard
                            subtotal={cart.subtotal}
                            tax={cart.tax}
                            taxLabel={cart.taxLabel}
                            shipping={shippingDisplay}
                            shippingCalculating={isCalculatingShipping}
                            total={total}
                        />
                        <CheckoutCta
                            boxed
                            label="Place order"
                            disabled={desktopPlaceDisabled}
                            loading={processingOrder || isPaymentLoading}
                            onClick={() => {
                                if (addresses.length === 0) {
                                    setEditingAddress(null);
                                    setView("add-address");
                                    return;
                                }
                                handlePlaceOrder(showCod && !hasPaymentGateway ? selectedPaymentMethod ?? "cod" : selectedPaymentMethod);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const addressPanel = (
        <AddAddressPanel
            initial={editingAddress}
            saving={savingAddress}
            onBack={() => setView(editingAddress ? "select-address" : "checkout")}
            onSave={handleSaveAddress}
        />
    );

    const selectPanel = (
        <SelectAddressPanel
            addresses={addresses}
            selectedId={selectedAddress ? addressKey(selectedAddress) : null}
            onSelect={(address) => {
                setSelectedAddress(address);
                setView("checkout");
            }}
            onEdit={(address) => {
                setEditingAddress(address);
                setView("add-address");
            }}
            onDelete={(address) => setAddressToDelete(address.addressId)}
            onAdd={() => {
                setEditingAddress(null);
                setView("add-address");
            }}
            onBack={() => setView("checkout")}
            addressToDelete={addressToDelete}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={() => setAddressToDelete(null)}
        />
    );

    const paymentPanel = (
        <>
            <CheckoutHeader title="Payment methods" onBack={() => setView("checkout")} />
            <PaymentMethodList
                total={total}
                selected={selectedPaymentMethod}
                onSelect={async (method) => {
                    setSelectedPaymentMethod(method);
                    await handlePlaceOrder(method);
                }}
                showCod={showCod}
                variant="mobile"
            />
            {orderError && <div className="px-4 pb-4"><div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{orderError}</div></div>}
        </>
    );

    return (
        <>
            {checkoutMain}
            {view === "add-address" && renderPanel(addressPanel, false)}
            {view === "select-address" && renderPanel(selectPanel, false)}
            {view === "payment-methods" && renderPanel(paymentPanel, false)}
            {view === "add-address" && renderPanel(addressPanel, true)}
            {view === "select-address" && renderPanel(selectPanel, true)}
        </>
    );
}
