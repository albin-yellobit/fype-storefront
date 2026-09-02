export interface ReverseGeocodeResult {
    country: string;
    state: string;
    city: string;
    pincode: string;
    area: string;
    house: string;
    latitude: number;
    longitude: number;
}

interface NominatimAddress {
    country_code?: string;
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleKey) {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`
            );
            const data = (await response.json()) as {
                results?: Array<{ address_components: Array<{ long_name: string; short_name: string; types: string[] }> }>;
            };
            const result = data.results?.[0];
            if (result) {
                let country = "";
                let state = "";
                let city = "";
                let pincode = "";
                let area = "";
                let house = "";
                result.address_components.forEach((component) => {
                    if (component.types.includes("country")) country = component.short_name;
                    if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                    if (component.types.includes("locality") || component.types.includes("administrative_area_level_2")) {
                        if (!city || component.types.includes("locality")) city = component.long_name;
                    }
                    if (component.types.includes("postal_code")) pincode = component.long_name;
                    if (component.types.includes("sublocality")) area = component.long_name;
                    if (component.types.includes("street_number") || component.types.includes("premise")) house = component.long_name;
                    if (component.types.includes("route") && !house) house = component.long_name;
                });
                return { country, state, city, pincode, area, house, latitude: lat, longitude: lng };
            }
        } catch {
            // Fall through to Nominatim
        }
    }

    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
                format: "jsonv2",
                lat: lat.toString(),
                lon: lng.toString(),
                addressdetails: "1",
                zoom: "18",
            }),
        { headers: { "User-Agent": "FYPE/1.0 (storefront)" } }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { address?: NominatimAddress };
    const addr = data.address;
    if (!addr) return null;
    return {
        country: (addr.country_code || "").toUpperCase(),
        state: addr.state || "",
        city: addr.city || addr.town || addr.village || "",
        pincode: addr.postcode || "",
        area: addr.suburb || addr.neighbourhood || addr.road || "",
        house: addr.house_number || "",
        latitude: lat,
        longitude: lng,
    };
}
