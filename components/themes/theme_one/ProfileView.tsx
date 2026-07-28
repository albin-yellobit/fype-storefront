"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateUserProfile, type User } from "@/redux/slices/userSlice";

interface ProfileViewProps {
    storeId?: string;
}

export default function ProfileView({ storeId }: ProfileViewProps) {
    const dispatch = useAppDispatch();
    const { user, authLoading, authError } = useAppSelector((state) => state.user);

    const [formData, setFormData] = useState({ firstName: "", email: "", phone: "" });
    const [successMessage, setSuccessMessage] = useState("");

    // Populate the form once the profile loads — adjusted during render
    // (comparing the previous user reference) rather than in an effect, same
    // pattern used elsewhere in this codebase.
    const [prevUser, setPrevUser] = useState<User | null>(user);
    if (user !== prevUser) {
        setPrevUser(user);
        if (user) {
            setFormData({
                firstName: `${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        if (!storeId) return;

        try {
            await dispatch(updateUserProfile({ storeId, data: { ...formData, lastName: "" } })).unwrap();
            setSuccessMessage("Profile updated successfully!");
        } catch {
            // Error surfaced via authError below
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm max-w-2xl">
            {authError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{authError}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        disabled
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-gray-400 mt-2 font-medium">Phone number is verified and cannot be changed.</p>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {authLoading ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
