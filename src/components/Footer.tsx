"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const showCopyright = pathname === "/";

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mt-6 border-t border-slate-100 pt-4" />
      </div>
      {showCopyright ? (
        <div className="fixed bottom-20 right-4 z-[60] text-xs text-slate-600">
          © 2026 All rights reserved najembezkary.pl
        </div>
      ) : null}
    </footer>
  );
}
