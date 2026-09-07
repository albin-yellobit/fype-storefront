import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { STOREFRONT_UNLOCK_COOKIE } from "@/lib/storefront-gate";
import type { ShopIdentity } from "@/types/storefront";

export async function enforceStorefrontPassword(shop: ShopIdentity | null): Promise<void> {
    if (!shop || shop.isPublished !== false) return;

    const headerStore = await headers();
    if (headerStore.get("x-editor-preview") === "1") return;

    const cookieStore = await cookies();
    if (cookieStore.get(STOREFRONT_UNLOCK_COOKIE)?.value === shop.shopId) return;

    redirect("/storefront-password");
}
