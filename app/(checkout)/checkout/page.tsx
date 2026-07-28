import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { getApiBaseUrl, getShopByDomain } from "@/lib/storefront-api";
import ShopNotFound from "@/components/shared/ShopNotFound";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const domain = host.split(":")[0];

    const apiBaseUrl = await getApiBaseUrl();
    const shop = await getShopByDomain(apiBaseUrl, domain);

    if (!shop) return <ShopNotFound />;

    const activeLogistics = shop.settings?.logistics?.active ?? ["manualShipping"];
    const hasDeliveryApp =
        (activeLogistics.includes("dtdc") && !!shop.settings?.logistics?.dtdc?.enabled) ||
        (activeLogistics.includes("delhivery") && !!shop.settings?.logistics?.delhivery?.enabled);
    const hasManualShipping = !hasDeliveryApp && !!shop.settings?.logistics?.manualShipping;
    const hasPaymentGateway = !!shop.settings?.payment?.razorpay?.enabled;

    return (
        <>
            {hasPaymentGateway && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />}
            <CheckoutView
                storeId={shop.shopId}
                shopName={shop.shopName}
                hasDeliveryApp={hasDeliveryApp}
                hasManualShipping={hasManualShipping}
                hasPaymentGateway={hasPaymentGateway}
            />
        </>
    );
}
