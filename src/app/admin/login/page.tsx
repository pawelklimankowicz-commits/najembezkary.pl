"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Nie udalo sie zalogowac.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udalo sie zalogowac.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell" style={{ maxWidth: "520px", paddingTop: "2.5rem" }}>
      <h1 className="page-title">Logowanie do panelu admina</h1>
      <p className="page-intro">Wpisz dane dostepowe, aby przejsc do panelu klientow.</p>

      {error ? (
        <p className="wizard-error" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="wizard-panel">
        <label className="field">
          <span>Login</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="field">
          <span>Haslo</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj"}
          </button>
        </div>
      </form>
    </main>
  );
}

