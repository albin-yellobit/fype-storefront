"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAddresses, addAddress, updateAddress, deleteAddress, type Address } from "@/redux/slices/userSlice";
import AddressCard from "./AddressCard";
import AddressFormLoader from "./AddressFormLoader";

interface AddressListProps {
    storeId: string;
    selectionMode?: boolean;
    selectedAddressId?: string;
    onAddressSelect?: (address: Address) => void;
}

export default function AddressList({ storeId, selectionMode = false, selectedAddressId, onAddressSelect }: AddressListProps) {
    const dispatch = useAppDispatch();
    const { addresses, addressesLoading, user } = useAppSelector((state) => state.user);

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (storeId) dispatch(fetchAddresses({ storeId }));
    }, [dispatch, storeId]);

    // Auto-show form only if no addresses exist and not in selection mode —
    // adjusted during render (comparing previous addresses.length/loading)
    // rather than in an effect, same pattern used elsewhere in this codebase.
    const [prevKey, setPrevKey] = useState(`${addresses.length}:${addressesLoading}`);
    const key = `${addresses.length}:${addressesLoading}`;
    if (key !== prevKey) {
        setPrevKey(key);
        if (!addressesLoading) {
            if (addresses.length === 0 && !selectionMode) setShowForm(true);
            else if (addresses.length > 0) setShowForm(false);
        }
    }

    const handleAddAddress = async (addressData: Omit<Address, "_id" | "addressId">) => {
        await dispatch(addAddress({ storeId, address: addressData }));
        setShowForm(false);

        if (selectionMode && addresses.length === 0) {
            const newAddresses = await dispatch(fetchAddresses({ storeId })).unwrap();
            if (newAddresses.length > 0 && onAddressSelect) onAddressSelect(newAddresses[0]);
        }
    };

    const handleUpdateAddress = async (addressData: Omit<Address, "_id" | "addressId">) => {
        if (editingAddress) {
            await dispatch(updateAddress({ storeId, addressId: editingAddress.addressId, address: addressData }));
            setEditingAddress(null);
            setShowForm(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            await dispatch(deleteAddress({ storeId, addressId }));
        }
    };

    const handleEditClick = (address: Address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    const handleAddNewClick = () => {
        setEditingAddress(null);
        setShowForm(true);
    };

    if (addressesLoading && addresses.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{editingAddress ? "Edit Address" : "Add New Address"}</h2>
                    {addresses.length > 0 && (
                        <button onClick={handleCancelForm} className="text-sm text-gray-600 hover:text-gray-800">
                            ← Back to addresses
                        </button>
                    )}
                </div>
                <div className="bg-white rounded-lg">
                    <AddressFormLoader
                        initialAddress={editingAddress}
                        onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
                        onCancel={addresses.length > 0 ? handleCancelForm : undefined}
                        userProfile={{ firstName: user?.firstName, lastName: user?.lastName, email: user?.email, phone: user?.phone }}
                    />
                </div>
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="space-y-4">
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">location_on</span>
                    <p className="text-gray-600 mb-4 font-semibold">No addresses saved yet</p>
                    <button onClick={handleAddNewClick} className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10">
                        Add Delivery Address
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div />
                <button
                    onClick={handleAddNewClick}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add New Address
                </button>
            </div>

            <div className="grid grid-cols-1 gap-0">
                {addresses.map((address) => (
                    <AddressCard
                        key={address.addressId}
                        address={address}
                        isSelected={selectionMode && selectedAddressId === (address._id || address.addressId)}
                        onSelect={selectionMode ? onAddressSelect : undefined}
                        onEdit={handleEditClick}
                        onDelete={() => handleDeleteAddress(address.addressId)}
                    />
                ))}
            </div>

            {selectionMode && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">Click on an address to select it for delivery</p>
                </div>
            )}
        </div>
    );
}
