"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrderById } from "@/redux/slices/userSlice";
import OrderDetail from "@/components/themes/theme_one/OrderDetails";

interface OrderDetailLoaderProps {
    storeId: string;
    orderId: string;
}

export default function OrderDetailLoader({ storeId, orderId }: OrderDetailLoaderProps) {
    const dispatch = useAppDispatch();
    const { currentOrder, ordersLoading, ordersError } = useAppSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchOrderById({ storeId, orderId }));
    }, [dispatch, storeId, orderId]);

    const isCurrentOrder = currentOrder && (currentOrder.orderNumber === orderId || currentOrder.orderId === orderId);

    if (ordersLoading && !isCurrentOrder) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isCurrentOrder || !currentOrder) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                <p className="text-gray-600 font-semibold">{ordersError || "Order not found"}</p>
            </div>
        );
    }

    return <OrderDetail order={currentOrder} storeId={storeId} />;
}
