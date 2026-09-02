"use client";

import { getCurrentStoreId } from "@/lib/client-store-context";
import OrderList from "./OrderList";

// Reference My Account opens on Orders — /accounts is the same surface.
export default function AccountOverview() {
    const storeId = getCurrentStoreId() || "";
    return <OrderList storeId={storeId} />;
}
