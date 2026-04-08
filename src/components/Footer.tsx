import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-bold text-[#C0392B]">najembezkary.pl</p>
            <p className="text-xs text-gray-400 mt-1">
              © {new Date().getFullYear()} najembezkary.pl. Wszelkie prawa zastrzeżone.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/regulamin" className="hover:text-[#C0392B] transition-colors">
              Regulamin
            </Link>
            <Link
              href="/polityka-prywatnosci"
              className="hover:text-[#C0392B] transition-colors"
            >
              Polityka prywatności
            </Link>
            <a
              href="mailto:kontakt@najembezkary.pl"
              className="hover:text-[#C0392B] transition-colors"
            >
              Kontakt
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6 border-t border-gray-100 pt-4">
          Serwis ma charakter informacyjny. Nie świadczymy usług prawnych. Dokumenty
          generowane są automatycznie i wymagają weryfikacji przez użytkownika.
        </p>
      </div>
    </footer>
  );
}
