import { Country } from "country-state-city";

export function countryName(isoOrName: string): string {
    if (!isoOrName) return "";
    if (isoOrName.length === 2) {
        return Country.getCountryByCode(isoOrName.toUpperCase())?.name || isoOrName;
    }
    return isoOrName;
}

export function toCountryIso(isoOrName: string): string {
    if (!isoOrName) return "";
    if (isoOrName.length === 2) return isoOrName.toUpperCase();
    const match = Country.getAllCountries().find((c) => c.name.toLowerCase() === isoOrName.toLowerCase());
    return match?.isoCode ?? isoOrName;
}

export function countrySelectOptions() {
    return Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode }));
}
