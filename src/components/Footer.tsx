import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-12">
        <div className="mt-6 border-t border-slate-100 pt-4" />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-1">
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600" aria-label="Nawigacja stopki">
          <Link
            href="/regulamin"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 transition-colors hover:border-[#C0392B] hover:text-[#C0392B]"
          >
            Regulamin
          </Link>
          <Link
            href="/polityka-prywatnosci"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 transition-colors hover:border-[#C0392B] hover:text-[#C0392B]"
          >
            Polityka prywatności
          </Link>
          <a
            href="mailto:kontakt@najembezkary.pl"
            className="rounded-md border border-slate-300 bg-white px-2 py-1 transition-colors hover:border-[#C0392B] hover:text-[#C0392B]"
          >
            Kontakt
          </a>
        </nav>
        <p className="px-2 py-1 text-[6px] text-slate-500">© {new Date().getFullYear()} najembezkary.pl. All rights reserved.</p>
      </div>
    </footer>
  );
}
