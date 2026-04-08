import type { MunicipalityLite } from "@/lib/checkout-flow";
import rawMunicipalities from "@janekolszak/poland/generated/json/municipalities.json";

type RawTree = Record<string, Record<string, string[]>>;

const tree = rawMunicipalities as RawTree;

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/[źż]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getOfficeName(name: string, county: string): string {
  const n = normalizeSlug(name);
  const c = normalizeSlug(county);
  if (n === c) return `Urząd Miasta ${name}`;
  return `Urząd Gminy ${name}`;
}

const GENERATED_MUNICIPALITIES: MunicipalityLite[] = (() => {
  const items: MunicipalityLite[] = [];
  let idx = 1;

  for (const [voivodeship, counties] of Object.entries(tree)) {
    for (const [county, names] of Object.entries(counties)) {
      for (const name of names) {
        const slug = normalizeSlug(name);
        items.push({
          teryt_code: `pl-${String(idx++).padStart(4, "0")}-${slug}`,
          name,
          full_name: `gmina ${name}`,
          type: "gmina",
          voivodeship,
          office_name: getOfficeName(name, county),
          office_address: null,
          office_phone: null,
          office_bip_url: `https://bip.${slug}.pl`,
          accepts_epuap: true,
          accepts_mail: true,
          accepts_in_person: true,
        });
      }
    }
  }

  return items;
})();

export function getPolandMunicipalitiesFallback(): MunicipalityLite[] {
  return GENERATED_MUNICIPALITIES;
}
