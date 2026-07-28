"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Address } from "@/redux/slices/userSlice";

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AddressFormWithMapProps {
    initialAddress?: Address | null;
    onSubmit: (address: Omit<Address, "_id" | "addressId">) => Promise<void>;
    onCancel?: () => void;
    userProfile?: { firstName?: string; lastName?: string; email?: string; phone?: string };
}

interface SearchSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        postcode?: string;
        house_number?: string;
        road?: string;
        county?: string;
        state_district?: string;
        local_authority?: string;
        country?: string;
    };
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function LocationPicker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void; position: [number, number] | null }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function AddressFormWithMap({ initialAddress, onSubmit, onCancel, userProfile }: AddressFormWithMapProps) {
    const [formData, setFormData] = useState({
        firstName: initialAddress?.firstName || userProfile?.firstName || "",
        lastName: initialAddress?.lastName || userProfile?.lastName || "",
        phoneNumber: (initialAddress?.phoneNumber || userProfile?.phone || "").startsWith("+")
            ? initialAddress?.phoneNumber || userProfile?.phone || ""
            : initialAddress?.phoneNumber || userProfile?.phone
              ? "+91" + (initialAddress?.phoneNumber || userProfile?.phone)
              : "",
        addressLine1: initialAddress?.addressLine1 || "",
        addressLine2: initialAddress?.addressLine2 || "",
        city: initialAddress?.city || "",
        state: initialAddress?.state || "",
        postalCode: initialAddress?.postalCode || "",
        country: initialAddress?.country || "India",
        latitude: initialAddress?.latitude || 12.9716,
        longitude: initialAddress?.longitude || 77.5946,
        isDefault: initialAddress?.isDefault || false,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState("");
    const [mapCenter, setMapCenter] = useState<[number, number]>([formData.latitude, formData.longitude]);

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Defensive catch-up for when userProfile arrives asynchronously after
        // mount (the initial useState above already reads it at construction
        // time, so this only matters for that race). `userProfile` is a new
        // object every render from the caller, so the render-time-comparison
        // pattern used elsewhere in this codebase doesn't apply cleanly here.
        if (!initialAddress && userProfile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData((prev) => ({
                ...prev,
                firstName: prev.firstName || userProfile.firstName || "",
                lastName: prev.lastName || userProfile.lastName || "",
                phoneNumber: prev.phoneNumber || (userProfile.phone ? (userProfile.phone.startsWith("+") ? userProfile.phone : "+91" + userProfile.phone) : ""),
            }));
        }
    }, [userProfile, initialAddress]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                    new URLSearchParams({ format: "jsonv2", lat: lat.toString(), lon: lng.toString(), addressdetails: "1", zoom: "18" }),
                { headers: { "User-Agent": "FYPE/1.0 (albin@yellobit.com)" } }
            );

            if (response.status === 429) {
                console.error("Rate limited by Nominatim");
                return;
            }
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = (await response.json()) as {
                address?: { city?: string; town?: string; village?: string; state?: string; postcode?: string; road?: string; house_number?: string };
                display_name?: string;
            };
            if (data.address) {
                const addr = data.address;
                setFormData((prev) => ({
                    ...prev,
                    city: addr.city || addr.town || addr.village || prev.city,
                    state: addr.state || prev.state,
                    postalCode: addr.postcode || prev.postalCode,
                    addressLine1: addr.road || data.display_name || prev.addressLine1,
                    addressLine2: addr.house_number || prev.addressLine2,
                }));
            }
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        }
    }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`
            );
            const data = (await response.json()) as SearchSuggestion[];
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch (error) {
            console.error("Search failed:", error);
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const formatSuggestionText = (suggestion: SearchSuggestion) => {
        const parts: string[] = [];
        const primaryName =
            suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.address.local_authority || suggestion.address.road;

        if (primaryName) parts.push(primaryName);
        if (suggestion.address.state_district && suggestion.address.state_district !== primaryName) {
            parts.push(suggestion.address.state_district);
        } else if (suggestion.address.county && suggestion.address.county !== primaryName) {
            parts.push(suggestion.address.county);
        }
        if (suggestion.address.state) parts.push(suggestion.address.state);
        if (suggestion.address.postcode) parts.push(suggestion.address.postcode);

        return parts.join(", ");
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        const newLat = parseFloat(suggestion.lat);
        const newLng = parseFloat(suggestion.lon);

        setSearchQuery(formatSuggestionText(suggestion));
        setShowSuggestions(false);
        setMapCenter([newLat, newLng]);

        setFormData((prev) => ({
            ...prev,
            latitude: newLat,
            longitude: newLng,
            city: suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.address.local_authority || prev.city,
            state: suggestion.address.state || prev.state,
            postalCode: suggestion.address.postcode || prev.postalCode,
            addressLine1: suggestion.address.road || suggestion.display_name || prev.addressLine1,
            addressLine2: suggestion.address.house_number || prev.addressLine2,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError("");

        const purePhone = formData.phoneNumber.replace(/\D/g, "");
        if (purePhone.length < 10) {
            setPhoneError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Failed to save address:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex-1 space-y-4">
                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for Delivery Area (e.g., Kochi, MG Road)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                        />
                        {searching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.place_id}
                                    type="button"
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors focus:outline-none focus:bg-gray-50"
                                >
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{formatSuggestionText(suggestion)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{suggestion.display_name}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {!searching && searchQuery.length >= 3 && suggestions.length === 0 && (
                        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
                            <p className="text-sm text-gray-500 text-center">No locations found. Try a different search or enter manually.</p>
                        </div>
                    )}
                </div>

                <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 relative">
                    <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <ChangeView center={mapCenter} />
                        <LocationPicker onLocationSelect={handleLocationSelect} position={[formData.latitude, formData.longitude]} />
                    </MapContainer>
                </div>
                <p className="text-xs text-center text-gray-500">Click on the map to place the delivery pointer exactly</p>
            </div>

            <div className="w-full md:w-80 space-y-4 flex flex-col justify-end">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="House/ Flat/ Office No."
                            value={formData.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            className="w-full p-3 border-b border-gray-200 focus:border-black outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Area / Street / Locality"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                            className="w-full p-3 border-b border-gray-200 focus:border-black outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full p-3 border-b border-gray-200 focus:border-black outline-none transition-colors"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Pincode"
                            value={formData.postalCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setFormData({ ...formData, postalCode: value });
                            }}
                            className="w-full p-3 border-b border-gray-200 focus:border-black outline-none transition-colors"
                            required
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.firstName + (formData.lastName ? " " + formData.lastName : "")}
                            onChange={(e) => {
                                const names = e.target.value.split(" ");
                                setFormData({ ...formData, firstName: names[0] || "", lastName: names.slice(1).join(" ") || "" });
                            }}
                            className="w-full p-3 border-b border-gray-200 focus:border-black outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <span className="p-3 border-b border-gray-200 text-gray-500">+91</span>
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={formData.phoneNumber.startsWith("+91") ? formData.phoneNumber.slice(3) : formData.phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setFormData({ ...formData, phoneNumber: "+91" + val });
                                if (val.length === 10) setPhoneError("");
                            }}
                            className={`flex-1 p-3 border-b focus:border-black outline-none transition-colors ${phoneError ? "border-red-500" : "border-gray-200"}`}
                            required
                            maxLength={10}
                        />
                    </div>
                    {phoneError && <p className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-wider">{phoneError}</p>}

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="w-4 h-4 accent-black"
                        />
                        <label htmlFor="isDefault" className="text-sm text-gray-600">
                            Use this as default address.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 uppercase tracking-wider"
                    >
                        {loading ? "Saving..." : initialAddress ? "Update Address" : "Save Address"}
                    </button>

                    {onCancel && (
                        <button type="button" onClick={onCancel} className="w-full text-sm text-gray-500 hover:text-black transition-colors">
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <style>{`
                .leaflet-container {
                    cursor: crosshair;
                }
            `}</style>
        </div>
    );
}
