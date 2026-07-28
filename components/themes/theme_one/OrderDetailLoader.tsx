"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchOrderById } from "@/redux/slices/userSlice";
import OrderDetail from "./OrderDetails";

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
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!isCurrentOrder || !currentOrder) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
                <p className="text-gray-600 font-semibold">{ordersError || "Order not found"}</p>
            </div>
        );
    }

    return <OrderDetail order={currentOrder} storeId={storeId} />;
}
