export interface TaxCalculationResult {
    displayPrice: string;
}

export const calculateProductTax = (
    basePrice: number,
    globalTax:
        | {
              global?: boolean;
              rate?: number;
              label?: string;
              inclusivePricing?: { webstore?: boolean };
          }
        | null
        | undefined,
    productTax: {
        applied?: boolean;
        rate?: number;
    }
): TaxCalculationResult => {
    const isGlobal = globalTax?.global ?? false;
    let effectiveRate = 0;
    const isInclusive = globalTax?.inclusivePricing?.webstore ?? false;

    if (isGlobal) {
        effectiveRate = globalTax?.rate ?? 0;
    } else {
        if (productTax?.applied) {
            effectiveRate = productTax?.rate ?? 0;
        } else {
            // Fallback to shop DB
            effectiveRate = globalTax?.rate ?? 0;
        }
    }

    const formatPrice = (value: number): string => Number(value.toFixed(2)).toString();

    if (effectiveRate === 0) {
        return { displayPrice: formatPrice(basePrice) };
    }

    if (isInclusive) {
        const priceWithTax = basePrice * (1 + effectiveRate / 100);
        return { displayPrice: formatPrice(priceWithTax) };
    }

    return { displayPrice: formatPrice(basePrice) };
};
