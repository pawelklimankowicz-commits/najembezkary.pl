export type PricingQuote = {
  propertyCount: number;
  total: number | null;
  perUnit: number | null;
  isCustomQuote: boolean;
  label: string;
};

export function getPackagePricing(propertyCountRaw: number | undefined): PricingQuote {
  const propertyCount = Math.max(1, Math.floor(propertyCountRaw ?? 1));

  if (propertyCount === 1) {
    return {
      propertyCount,
      total: 99,
      perUnit: 99,
      isCustomQuote: false,
      label: "1 lokal — 99 zł",
    };
  }
  if (propertyCount === 2) {
    return {
      propertyCount,
      total: 179,
      perUnit: 89.5,
      isCustomQuote: false,
      label: "2 lokale — 179 zł (89,50 zł / lokal)",
    };
  }
  if (propertyCount === 3) {
    return {
      propertyCount,
      total: 249,
      perUnit: 83,
      isCustomQuote: false,
      label: "3 lokale — 249 zł (83,00 zł / lokal)",
    };
  }
  if (propertyCount >= 4 && propertyCount <= 5) {
    const perUnit = 79;
    return {
      propertyCount,
      total: propertyCount * perUnit,
      perUnit,
      isCustomQuote: false,
      label: `4–5 lokali — ${perUnit.toFixed(2).replace(".", ",")} zł / lokal`,
    };
  }
  if (propertyCount >= 6 && propertyCount <= 10) {
    const perUnit = 69;
    return {
      propertyCount,
      total: propertyCount * perUnit,
      perUnit,
      isCustomQuote: false,
      label: `6–10 lokali — ${perUnit.toFixed(2).replace(".", ",")} zł / lokal`,
    };
  }

  return {
    propertyCount,
    total: null,
    perUnit: null,
    isCustomQuote: true,
    label: "11+ lokali — wycena indywidualna (od 59 zł / lokal)",
  };
}

export function formatPricePln(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} zł`;
}
