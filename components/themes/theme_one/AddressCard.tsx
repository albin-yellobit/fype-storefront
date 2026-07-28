import type { Address } from "@/redux/slices/userSlice";

interface AddressCardProps {
    address: Address;
    isSelected?: boolean;
    onSelect?: (address: Address) => void;
    onEdit?: (address: Address) => void;
    onDelete?: (addressId: string) => void;
}

export default function AddressCard({ address, isSelected = false, onSelect, onEdit, onDelete }: AddressCardProps) {
    return (
        <div
            onClick={() => onSelect?.(address)}
            className={`relative p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group ${onSelect ? "cursor-pointer" : ""}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 uppercase tracking-tight mb-1">
                        {address.firstName || address.lastName ? `${address.firstName || ""} ${address.lastName || ""}`.trim() : "Address"}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.addressLine1}</p>
                        <p>
                            {address.addressLine2}, {address.city}, {address.state}
                        </p>
                        <p>{address.postalCode}</p>
                        <p className="font-medium text-gray-400">Phone: {address.phoneNumber}</p>
                    </div>
                </div>

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(address._id || address.addressId);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                )}
            </div>

            {onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(address);
                    }}
                    className="text-xs font-medium text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-all uppercase"
                >
                    Edit
                </button>
            )}

            {isSelected && <div className="absolute left-0 top-0 w-1 h-full bg-black"></div>}
        </div>
    );
}
