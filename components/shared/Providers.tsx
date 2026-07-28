"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import { setCurrentStoreId } from "@/lib/client-store-context";
import { fetchUserProfile, fetchCart, fetchGuestCart } from "@/redux/slices/userSlice";

// Mirrors the SPA's App.tsx bootstrap: try the authenticated profile+cart first,
// fall back to a guest cart if that fails. Runs once per storeId. Shared by both
// the (storefront) and (checkout) route groups — identical bootstrap either way.
function AuthBootstrap({ storeId }: { storeId: string }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            const profileResult = await dispatch(fetchUserProfile({ storeId }));
            if (fetchUserProfile.fulfilled.match(profileResult)) {
                dispatch(fetchCart({ storeId }));
            } else {
                dispatch(fetchGuestCart({ storeId }));
            }
        })();
    }, [dispatch, storeId]);

    return null;
}

interface ProvidersProps {
    storeId?: string;
    children: React.ReactNode;
}

export default function Providers({ storeId, children }: ProvidersProps) {
    const [store] = useState(() => makeStore());

    useEffect(() => {
        setCurrentStoreId(storeId ?? null);
    }, [storeId]);

    return (
        <Provider store={store}>
            {storeId && <AuthBootstrap storeId={storeId} />}
            {children}
        </Provider>
    );
}
