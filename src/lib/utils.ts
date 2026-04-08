/** Sklejanie klas CSS bez zewnętrznych paczek (Tailwind / własne klasy). */
export function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const parts: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") parts.push(input);
    else if (typeof input === "object")
      for (const [k, v] of Object.entries(input)) if (v) parts.push(k);
  }
  return parts.join(" ");
}
