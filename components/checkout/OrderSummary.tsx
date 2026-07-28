import type { CartItem } from "@/redux/slices/userSlice";

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number | null;
    total: number;
    shippingCalculating?: boolean;
}

export default function OrderSummary({ items, subtotal, tax, shipping, total, shippingCalculating = false }: OrderSummaryProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                            <img src={item.image || "/placeholder-product.png"} alt={item.name} className="w-full h-full object-cover rounded" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                            {item.options && (
                                <p className="text-xs text-gray-500">{Object.values(item.options).join(" / ")}</p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                                <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                        {shippingCalculating ? (
                            <span className="text-blue-600 text-xs">Calculating...</span>
                        ) : shipping !== null ? (
                            shipping === 0 ? (
                                <span className="text-green-600">Free</span>
                            ) : (
                                `₹${shipping.toFixed(2)}`
                            )
                        ) : (
                            <span className="text-gray-400 text-xs">To be calculated</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{(shipping !== null ? total + shipping : total).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="text-xs">Secure Checkout - SSL Encrypted</span>
            </div>
        </div>
    );
}
