"use client";

import type { Address } from "@/redux/slices/userSlice";
import { addressDetails, addressDisplayName, addressKey, addressTypeLabel } from "./checkoutUtils";
import CheckoutHeader from "./CheckoutHeader";
import { Check, Edit2, PlusCircle, Trash2 } from "lucide-react";

interface SelectAddressPanelProps {
    addresses: Address[];
    selectedId: string | null;
    onSelect: (address: Address) => void;
    onEdit: (address: Address) => void;
    onDelete: (address: Address) => void;
    onAdd: () => void;
    onBack: () => void;
    addressToDelete: string | null;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
}

export default function SelectAddressPanel({
    addresses,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onAdd,
    onBack,
    addressToDelete,
    onConfirmDelete,
    onCancelDelete,
}: SelectAddressPanelProps) {
    return (
        <>
            <CheckoutHeader title="Select Address" onBack={onBack} />
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 flex flex-col gap-4 bg-gray-50/50">
                {addresses.map((address) => {
                    const id = addressKey(address);
                    const isSelected = selectedId === id;
                    return (
                        <div
                            key={id}
                            onClick={() => onSelect(address)}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 shadow-sm ${
                                isSelected ? "border-gray-900 bg-white ring-1 ring-gray-900/5" : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                        >
                            <div className="mt-0.5">
                                {isSelected ? (
                                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" size={12} />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-[15px]">{addressDisplayName(address)}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {addressTypeLabel(address)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 -mr-2 -mt-2">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(address);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                                        >
                                            <Edit2 className="w-[18px] h-[18px]" size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(address);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-[18px] h-[18px]" size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-500 leading-relaxed font-medium">{addressDetails(address)}</p>
                            </div>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-2 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-semibold hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-colors bg-white"
                >
                    <PlusCircle className="w-5 h-5" size={20} />
                    Add New Address
                </button>
            </div>

            {addressToDelete !== null && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-[320px] p-5 shadow-2xl flex flex-col gap-4">
                        <h3 className="font-bold text-[18px] text-gray-900">Delete Address</h3>
                        <p className="text-gray-600 text-[14px]">Are you sure you want to delete this address? This action cannot be undone.</p>
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={onCancelDelete}
                                className="px-4 py-2 text-[14px] font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmDelete}
                                className="px-4 py-2 text-[14px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
