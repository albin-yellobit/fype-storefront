// Plain module state (not React context) so lib/client-api.ts's axios
// interceptor can read the current storeId outside the React tree — same role
// the SPA's `store.getState().shopIdentity.shop?.shopId` played, without
// depending on the full Redux store just for one id. Set once by
// app/(storefront)/providers.tsx from the server-resolved shop.
let currentStoreId: string | null = null;

export function setCurrentStoreId(storeId: string | null) {
    currentStoreId = storeId;
}

export function getCurrentStoreId(): string | null {
    return currentStoreId;
}
