import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-12">
        <nav className="text-left" aria-label="Nawigacja stopki" style={{ transform: "translateY(-2cm)" }}>
          <ul className="space-y-2 text-sm font-medium text-slate-600">
            <li>
              <Link href="/regulamin" className="block transition-colors hover:text-[#C0392B]">
                Regulamin
              </Link>
            </li>
            <li>
              <Link
                href="/polityka-prywatnosci"
                className="block transition-colors hover:text-[#C0392B]"
              >
                Polityka prywatności
              </Link>
            </li>
            <li>
              <a
                href="mailto:kontakt@najembezkary.pl"
                className="block transition-colors hover:text-[#C0392B]"
              >
                Kontakt
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-6 border-t border-slate-100 pt-4" />
      </div>
      <p
        className="fixed z-50 px-2 py-1 text-[6px] text-slate-500"
        style={{ right: 0, bottom: 0, left: "auto", textAlign: "right", direction: "ltr" }}
      >
        © {new Date().getFullYear()} najembezkary.pl. All rights reserved.
      </p>
    </footer>
  );
}
