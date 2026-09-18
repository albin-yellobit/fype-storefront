import type { ShopIdentity } from "@/types/storefront";

// The registered, adapter-backed gateway keys this storefront knows how to
// check out with. Kept as a small local allowlist (not derived from
// shop.settings.payment.active directly) so an unexpected/unsupported value
// in active[] (e.g. a future gateway this frontend hasn't shipped an adapter
// for yet) never produces a "gateway" the UI can't actually open.
const KNOWN_GATEWAY_KEYS = ["razorpay", "stripe"] as const;
type KnownGatewayKey = (typeof KNOWN_GATEWAY_KEYS)[number];

/**
 * shop.settings.payment.active[] is now server-derived and trustworthy (see
 * crmApp's activeGateways.ts) - this replaces the old single
 * `hasPaymentGateway` boolean with the real list of gateways actually usable
 * for this store, filtered to ones this frontend has an adapter for.
 */
export function useActiveGateways(shop: Pick<ShopIdentity, "settings"> | null | undefined): KnownGatewayKey[] {
    const active = shop?.settings?.payment?.active ?? [];
    return KNOWN_GATEWAY_KEYS.filter((key) => active.includes(key));
}

/** Non-hook variant for use in server components (e.g. checkout/page.tsx). */
export function resolveActiveGateways(shop: Pick<ShopIdentity, "settings"> | null | undefined): KnownGatewayKey[] {
    const active = shop?.settings?.payment?.active ?? [];
    return KNOWN_GATEWAY_KEYS.filter((key) => active.includes(key));
}
