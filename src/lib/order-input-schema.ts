import { z } from "zod";

import type { OrderDocumentBuildInput } from "@/lib/build-documents-zip";

function optPositiveNumber(val: unknown): unknown {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}

function optInt(val: unknown): unknown {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
}

/** Walidacja body POST `/api/documents` — zgodna z `buildDocumentsZipBuffer`. */
export const orderDocumentInputSchema = z.object({
  owner_name: z.string().min(2, "Podaj imię i nazwisko"),
  owner_city: z.string().min(1, "Podaj miejscowość"),
  owner_address: z.string().min(1, "Podaj adres"),
  owner_zip: z.string().min(1, "Podaj kod pocztowy"),
  owner_pesel: z.string().optional().nullable(),
  owner_identity_document: z.string().optional().nullable(),
  email: z.string().email("Podaj prawidłowy adres e-mail"),
  owner_phone: z.string().min(5, "Podaj numer telefonu"),
  property_address: z.string().min(1, "Podaj adres obiektu"),
  property_city: z.string().min(1, "Podaj miejscowość obiektu"),
  property_zip: z.string().optional().nullable(),
  property_type: z.enum(["mieszkanie", "dom", "apartament", "pokoj"], {
    message: "Wybierz rodzaj obiektu",
  }),
  property_area: z.preprocess(
    optPositiveNumber,
    z.number().positive().optional().nullable()
  ),
  property_floor: z.preprocess(optInt, z.number().int().optional().nullable()),
  rental_platform: z
    .array(z.enum(["airbnb", "booking", "other", "direct"]))
    .default([]),
  rental_since: z.string().optional().nullable(),
  quiz_answers: z.object({
    q3: z.enum(["up_to_4", "5_to_10", "above_10"], {
      message: "Wybierz przewidywaną liczbę osób",
    }),
    owner_units_json: z.string().optional().nullable(),
  }),
});

export type OrderDocumentFormInput = z.infer<typeof orderDocumentInputSchema>;

export function toOrderDocumentBuildInput(
  v: OrderDocumentFormInput
): OrderDocumentBuildInput {
  return {
    owner_name: v.owner_name,
    owner_city: v.owner_city,
    owner_address: v.owner_address,
    owner_zip: v.owner_zip,
    owner_pesel: v.owner_pesel ?? null,
    owner_identity_document: v.owner_identity_document ?? null,
    email: v.email,
    owner_phone: v.owner_phone,
    property_address: v.property_address,
    property_city: v.property_city,
    property_zip: v.property_zip ?? null,
    property_type: v.property_type,
    property_area: v.property_area ?? null,
    property_floor: v.property_floor ?? null,
    rental_platform: v.rental_platform.length ? v.rental_platform : null,
    rental_since: v.rental_since ?? null,
    quiz_answers: v.quiz_answers,
  };
}
