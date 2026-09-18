import type { Address, CartItem } from "@/redux/slices/userSlice";
import { countryName } from "./ui/countries";

export type CheckoutViewState = "checkout" | "add-address" | "select-address" | "payment-methods";
// Widened from a closed 'upi'|'card'|'netbanking'|'cod' union: method ids are
// now gateway-namespaced (e.g. "razorpay_upi", "stripe_card") since each
// active gateway adapter contributes its own methods - see
// types/checkoutGateway.ts's PaymentMethodOption. "cod" remains the one
// literal id outside any gateway adapter (manual payment, not a gateway).
export type PaymentMethodId = string;

export function addressKey(address: Address): string {
    return address.addressId || address._id || "";
}

export function addressDisplayName(address: Address): string {
    return [address.firstName, address.lastName].filter(Boolean).join(" ").trim() || "Address";
}

export function addressDetails(address: Address): string {
    const country = countryName(address.country);
    return [address.addressLine1, address.addressLine2, address.city, address.state, country, address.postalCode]
        .filter(Boolean)
        .join(", ");
}

export function addressTypeLabel(address: Address): string {
    return address.isDefault ? "Default" : "Home";
}

export function variantLabel(item: CartItem): string {
    if (!item.options) return "";
    return Object.values(item.options).filter(Boolean).join(" / ");
}

export function formatInr(amount: number): string {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
