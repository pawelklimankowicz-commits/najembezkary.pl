import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-xl text-[#C0392B] tracking-tight hover:opacity-80 transition-opacity"
        >
          najembezkary.pl
        </Link>

        <Link
          href="/quiz"
          className="bg-[#C0392B] hover:bg-[#A93226] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm whitespace-nowrap"
        >
          Sprawdz obowiazek →
        </Link>
      </div>
    </nav>
  );
}
