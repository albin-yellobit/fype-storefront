import { headers } from "next/headers";
import Link from "next/link";
import { getApiBaseUrl, getShopByDomain } from "@/lib/storefront-api";
import Providers from "@/components/shared/Providers";
import "./checkout.css";

// Minimal shell, deliberately not routed through the theme registry — checkout
// is one canonical flow shared by every theme/store (see MIGRATION_RUNBOOK.md
// Phase 2/3 architecture decision), not themed like Cart/Wishlist/Account.
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const domain = host.split(":")[0];

    const apiBaseUrl = await getApiBaseUrl();
    const shop = await getShopByDomain(apiBaseUrl, domain);

    return (
        <Providers storeId={shop?.shopId}>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <header className="bg-white border-b border-gray-100 py-4">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <Link href="/" className="text-lg font-bold tracking-tight text-black">
                            {shop?.shopName || "Store"}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-base">lock</span>
                            Secure Checkout
                        </div>
                    </div>
                </header>
                <main className="grow">{children}</main>
            </div>
        </Providers>
    );
}
