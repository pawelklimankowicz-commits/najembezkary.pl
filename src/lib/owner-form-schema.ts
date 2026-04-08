import { z } from "zod";

/** Etykiety platform — zgodne z identyfikatorami w formularzu zamówienia. */
export const RENTAL_PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  other: "Inna platforma",
  direct: "Bezpośrednio (własna strona / ogłoszenia)",
};

/** Jednostka z quizu (wielolokalowość) — sparsowane z `owner_units_json`. */
export const ownerUnitSchema = z.object({
  fullName: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  pesel: z.string().optional().nullable(),
  identityDocument: z.string().optional().nullable(),
  propertyAddress: z.string().optional().nullable(),
  propertyCity: z.string().optional().nullable(),
  propertyZip: z.string().optional().nullable(),
  propertyType: z.string().optional().nullable(),
  propertyArea: z.number().optional().nullable(),
  propertyFloor: z.number().optional().nullable(),
  listingName: z.string().optional().nullable(),
});

export type OwnerUnitOutput = z.infer<typeof ownerUnitSchema>;
