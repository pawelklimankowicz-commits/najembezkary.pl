import { NextResponse } from "next/server";

import { MUNICIPALITIES_FALLBACK } from "@/lib/municipalities-fallback";
import { getPolandMunicipalitiesFallback } from "@/lib/poland-municipalities";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { MunicipalityLite } from "@/lib/checkout-flow";

export const runtime = "nodejs";

function normalizeText(value: string): string {
  return value
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/ą/g, "a")
    .replace(/Ą/g, "A")
    .replace(/ć/g, "c")
    .replace(/Ć/g, "C")
    .replace(/ę/g, "e")
    .replace(/Ę/g, "E")
    .replace(/ń/g, "n")
    .replace(/Ń/g, "N")
    .replace(/ó/g, "o")
    .replace(/Ó/g, "O")
    .replace(/ś/g, "s")
    .replace(/Ś/g, "S")
    .replace(/ź/g, "z")
    .replace(/Ź/g, "Z")
    .replace(/ż/g, "z")
    .replace(/Ż/g, "Z")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const MAJOR_CITY_DISTRICT_HINTS: MunicipalityLite[] = [
  {
    teryt_code: "hint-warszawa-ursynow",
    name: "Warszawa Ursynow",
    full_name: "gmina/dzielnica: Warszawa Ursynow",
    type: "dzielnica",
    voivodeship: "mazowieckie",
    office_name: "Urzad dzielnicy (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-warszawa-wlochy",
    name: "Warszawa Wlochy",
    full_name: "gmina/dzielnica: Warszawa Wlochy",
    type: "dzielnica",
    voivodeship: "mazowieckie",
    office_name: "Urzad dzielnicy (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-warszawa-mokotow",
    name: "Warszawa Mokotow",
    full_name: "gmina/dzielnica: Warszawa Mokotow",
    type: "dzielnica",
    voivodeship: "mazowieckie",
    office_name: "Urzad dzielnicy (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-krakow",
    name: "Krakow",
    full_name: "gmina miejska: Krakow",
    type: "miasto_na_prawach_powiatu",
    voivodeship: "malopolskie",
    office_name: "Urzad Miasta (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-krakow-podgorze",
    name: "Krakow Podgorze",
    full_name: "dzielnica/gmina: Krakow Podgorze",
    type: "dzielnica",
    voivodeship: "malopolskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-krakow-nowa-huta",
    name: "Krakow Nowa Huta",
    full_name: "dzielnica/gmina: Krakow Nowa Huta",
    type: "dzielnica",
    voivodeship: "malopolskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-poznan",
    name: "Poznan",
    full_name: "gmina miejska: Poznan",
    type: "miasto_na_prawach_powiatu",
    voivodeship: "wielkopolskie",
    office_name: "Urzad Miasta (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-poznan-grunwald",
    name: "Poznan Grunwald",
    full_name: "dzielnica/gmina: Poznan Grunwald",
    type: "dzielnica",
    voivodeship: "wielkopolskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-poznan-jezyce",
    name: "Poznan Jezyce",
    full_name: "dzielnica/gmina: Poznan Jezyce",
    type: "dzielnica",
    voivodeship: "wielkopolskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-wroclaw",
    name: "Wroclaw",
    full_name: "gmina miejska: Wroclaw",
    type: "miasto_na_prawach_powiatu",
    voivodeship: "dolnoslaskie",
    office_name: "Urzad Miasta (wlasciwy dla adresu lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-wroclaw-psie-pole",
    name: "Wroclaw Psie Pole",
    full_name: "dzielnica/gmina: Wroclaw Psie Pole",
    type: "dzielnica",
    voivodeship: "dolnoslaskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "hint-wroclaw-krzyki",
    name: "Wroclaw Krzyki",
    full_name: "dzielnica/gmina: Wroclaw Krzyki",
    type: "dzielnica",
    voivodeship: "dolnoslaskie",
    office_name: "Urzad Miasta (wlasciwy dla dzielnicy lokalu)",
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
];

function withDistrictHints(query: string, base: MunicipalityLite[]): MunicipalityLite[] {
  const nq = normalizeText(query);
  const hints = MAJOR_CITY_DISTRICT_HINTS.filter((h) =>
    normalizeText(`${h.name} ${h.full_name} ${h.voivodeship}`).includes(nq)
  );
  const merged = [...base, ...hints];
  const byName = new Map<string, MunicipalityLite>();
  for (const item of merged) {
    const key = normalizeText(`${item.name}|${item.voivodeship}`);
    if (!byName.has(key)) byName.set(key, item);
  }
  return Array.from(byName.values());
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const qq = normalizeText(q);
      const source = getPolandMunicipalitiesFallback();
      const local = (source.length > 0 ? source : MUNICIPALITIES_FALLBACK).filter(
        (m) =>
          normalizeText(m.name).includes(qq) ||
          normalizeText(m.full_name).includes(qq) ||
          normalizeText(m.voivodeship).includes(qq)
      );
      return NextResponse.json({ results: withDistrictHints(q, local).slice(0, 80) });
    }
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("municipalities")
      .select(
        "teryt_code,name,full_name,type,voivodeship,office_name,office_address,office_phone,office_bip_url,accepts_epuap,accepts_mail,accepts_in_person"
      )
      .or(`name.ilike.%${q}%,full_name.ilike.%${q}%,voivodeship.ilike.%${q}%`)
      .limit(80);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ results: withDistrictHints(q, (data ?? []) as MunicipalityLite[]).slice(0, 80) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd wyszukiwania gmin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
