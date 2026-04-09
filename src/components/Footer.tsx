"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const showCopyright = pathname === "/";

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {showCopyright ? (
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
            © 2026 All rights reserved najembezkary.pl
          </div>
        ) : (
          <div className="mt-6 border-t border-slate-100 pt-4" />
        )}
      </div>
    </footer>
  );
}
