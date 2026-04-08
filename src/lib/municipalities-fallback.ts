import type { MunicipalityLite } from "@/lib/checkout-flow";

export const MUNICIPALITIES_FALLBACK: MunicipalityLite[] = [
  {
    teryt_code: "1261011",
    name: "Krakow",
    full_name: "gmina miejska Krakow",
    type: "miasto_na_prawach_powiatu",
    voivodeship: "malopolskie",
    office_name: "Urzad Miasta Krakowa",
    office_address: "pl. Wszystkich Swietych 3-4, 31-004 Krakow",
    office_phone: "(12) 616 16 16",
    office_bip_url: "https://www.bip.krakow.pl",
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
  {
    teryt_code: "1465011",
    name: "Warszawa",
    full_name: "miasto stoleczne Warszawa",
    type: "miasto_na_prawach_powiatu",
    voivodeship: "mazowieckie",
    office_name: "Urzad m.st. Warszawy",
    office_address: "pl. Bankowy 3/5, 00-950 Warszawa",
    office_phone: "19115",
    office_bip_url: "https://bip.warszawa.pl",
    accepts_epuap: true,
    accepts_mail: true,
    accepts_in_person: true,
  },
];
