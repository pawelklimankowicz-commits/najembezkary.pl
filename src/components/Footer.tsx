export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mt-6 border-t border-slate-100 pt-4" />
        <p
          className="text-slate-500"
          style={{ fontSize: "8px", textAlign: "center", width: "100%", margin: 0 }}
        >
          © {new Date().getFullYear()} najembezkary.pl. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
