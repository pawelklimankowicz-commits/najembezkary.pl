import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-start gap-3 text-left">
          <nav className="flex flex-col items-start gap-2 text-sm text-slate-600" aria-label="Nawigacja stopki">
            <Link href="/regulamin" className="transition-colors hover:text-[#C0392B]">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="transition-colors hover:text-[#C0392B]">
              Polityka prywatności
            </Link>
            <a
              href="mailto:kontakt@najembezkary.pl"
              className="transition-colors hover:text-[#C0392B]"
            >
              Kontakt
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-left">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()}. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
