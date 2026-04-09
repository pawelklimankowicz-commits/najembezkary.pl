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

function slug(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-");
}

function createHint(
  city: string,
  district: string,
  voivodeship: string,
  office: string
): MunicipalityLite {
  const display = district ? `${city} ${district}` : city;
  return {
    teryt_code: `hint-${slug(display)}`,
    name: display,
    full_name: district ? `gmina/dzielnica: ${display}` : `gmina miejska: ${city}`,
    type: district ? "dzielnica" : "miasto_na_prawach_powiatu",
    voivodeship,
    office_name: office,
    office_address: null,
    office_phone: null,
    office_bip_url: null,
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  };
}

const CITY_DISTRICT_CATALOG: Array<{
  city: string;
  voivodeship: string;
  districts: string[];
}> = [
  {
    city: "Warszawa",
    voivodeship: "mazowieckie",
    districts: [
      "Bemowo",
      "Bialoleka",
      "Bielany",
      "Mokotow",
      "Ochota",
      "Praga-Polnoc",
      "Praga-Poludnie",
      "Rembertow",
      "Srodmiescie",
      "Targowek",
      "Ursus",
      "Ursynow",
      "Wawer",
      "Wesola",
      "Wilanow",
      "Wlochy",
      "Wola",
      "Zoliborz",
    ],
  },
  {
    city: "Krakow",
    voivodeship: "malopolskie",
    districts: [
      "Stare Miasto",
      "Grzegorzki",
      "Pradnik Czerwony",
      "Pradnik Bialy",
      "Krowodrza",
      "Bronowice",
      "Zwierzyniec",
      "Debniki",
      "Lagiewniki-Borek Falecki",
      "Swoszowice",
      "Podgorze Duchackie",
      "Biezanow-Prokocim",
      "Podgorze",
      "Czyzyny",
      "Mistrzejowice",
      "Bienczyce",
      "Wzgorza Krzeslawickie",
      "Nowa Huta",
    ],
  },
  {
    city: "Lodz",
    voivodeship: "lodzkie",
    districts: ["Baluty", "Gorna", "Polesie", "Srodmiescie", "Widzew"],
  },
  {
    city: "Poznan",
    voivodeship: "wielkopolskie",
    districts: ["Grunwald", "Jezyce", "Nowe Miasto", "Stare Miasto", "Wilda"],
  },
  {
    city: "Wroclaw",
    voivodeship: "dolnoslaskie",
    districts: ["Fabryczna", "Krzyki", "Psie Pole", "Srodmiescie", "Stare Miasto"],
  },
  {
    city: "Gdansk",
    voivodeship: "pomorskie",
    districts: ["Srodmiescie", "Wrzeszcz", "Oliwa", "Przymorze", "Orunia", "Chehm"],
  },
  {
    city: "Szczecin",
    voivodeship: "zachodniopomorskie",
    districts: ["Prawobrzeze", "Srodmiescie", "Polnoc", "Zachod"],
  },
  { city: "Lublin", voivodeship: "lubelskie", districts: ["Srodmiescie", "Czechow", "Czuby"] },
  {
    city: "Katowice",
    voivodeship: "slaskie",
    districts: ["Srodmiescie", "Ligota-Panewniki", "Bogucice", "Dab"],
  },
  {
    city: "Bialystok",
    voivodeship: "podlaskie",
    districts: ["Centrum", "Bojary", "Piaski", "Nowe Miasto"],
  },
  {
    city: "Bydgoszcz",
    voivodeship: "kujawsko-pomorskie",
    districts: ["Srodmiescie", "Fordon", "Bartodzieje"],
  },
  {
    city: "Torun",
    voivodeship: "kujawsko-pomorskie",
    districts: ["Stare Miasto", "Bydgoskie Przedmiescie", "Mokre"],
  },
  {
    city: "Rzeszow",
    voivodeship: "podkarpackie",
    districts: ["Srodmiescie", "Nowe Miasto", "Drabinianka"],
  },
  {
    city: "Kielce",
    voivodeship: "swietokrzyskie",
    districts: ["Srodmiescie", "KSM", "Czarnow"],
  },
  {
    city: "Olsztyn",
    voivodeship: "warminsko-mazurskie",
    districts: ["Srodmiescie", "Jaroty", "Kortowo"],
  },
  { city: "Opole", voivodeship: "opolskie", districts: ["Srodmiescie", "Zaodrze", "Kolonia Goslawicka"] },
  {
    city: "Gorzow Wielkopolski",
    voivodeship: "lubuskie",
    districts: ["Srodmiescie", "Zawarcie", "Gorczyn"],
  },
  {
    city: "Zielona Gora",
    voivodeship: "lubuskie",
    districts: ["Srodmiescie", "Racula", "Jedrzychow"],
  },
];

const MAJOR_CITY_DISTRICT_HINTS: MunicipalityLite[] = CITY_DISTRICT_CATALOG.flatMap(
  ({ city, voivodeship, districts }) => [
    createHint(city, "", voivodeship, "Urzad Miasta (wlasciwy dla adresu lokalu)"),
    ...districts.map((district) =>
      createHint(
        city,
        district,
        voivodeship,
        "Urzad dzielnicy / punkt obslugi mieszkancow (wlasciwy dla adresu lokalu)"
      )
    ),
  ]
);

const MAJOR_CITY_QUERY_KEYS = new Set(
  CITY_DISTRICT_CATALOG.map((item) => normalizeText(item.city))
);

function rankMunicipalityForQuery(q: string, m: MunicipalityLite): number {
  const nq = normalizeText(q);
  const name = normalizeText(m.name);
  const full = normalizeText(m.full_name);
  if (name === nq) return 0;
  if (name.startsWith(`${nq} `)) return 1;
  if (name.startsWith(nq)) return 2;
  if (full.includes(` ${nq} `)) return 3;
  if (full.includes(nq)) return 4;
  return 5;
}

function filterAndSortByQueryContext(query: string, base: MunicipalityLite[]): MunicipalityLite[] {
  const nq = normalizeText(query);
  let filtered = base;
  if (MAJOR_CITY_QUERY_KEYS.has(nq)) {
    filtered = base.filter((m) => {
      const name = normalizeText(m.name);
      return name === nq || name.startsWith(`${nq} `);
    });
  }
  return [...filtered].sort((a, b) => {
    const ra = rankMunicipalityForQuery(query, a);
    const rb = rankMunicipalityForQuery(query, b);
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "pl");
  });
}

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
  return filterAndSortByQueryContext(query, Array.from(byName.values()));
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
