"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DATA_STORAGE_KEY, type OwnerDataState } from "@/lib/checkout-flow";

const initial: OwnerDataState = {
  fullName: "",
  address: "",
  city: "",
  zip: "",
  phone: "",
  email: "",
  propertyAddress: "",
  propertyCity: "",
  propertyZip: "",
  propertyType: "mieszkanie",
  platforms: [],
};

function normalizeUppercase(value: string) {
  return value.toLocaleUpperCase("pl-PL");
}

function normalizeLowercase(value: string) {
  return value.toLocaleLowerCase("pl-PL");
}

function formatPolishPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export function DataForm() {
  const router = useRouter();
  const [form, setForm] = useState<OwnerDataState>(initial);
  const [error, setError] = useState("");

  function setTextField<K extends keyof OwnerDataState>(key: K, value: OwnerDataState[K]) {
    const nextValue = (() => {
      if (typeof value !== "string") return value;
      if (key === "email") return normalizeLowercase(value) as OwnerDataState[K];
      return normalizeUppercase(value) as OwnerDataState[K];
    })();
    setForm((prev) => ({ ...prev, [key]: nextValue }));
  }

  function saveAndGo() {
    if (!form.fullName || !form.email || !form.address || !form.propertyAddress) {
      setError("Uzupełnij wymagane pola.");
      return;
    }
    sessionStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(form));
    router.push("/platnosc");
  }

  return (
    <div className="wizard">
      {error ? <p className="wizard-error">{error}</p> : null}
      <div className="field-grid">
        <label className="field">
          <span>Imię i nazwisko *</span>
          <input value={form.fullName} onChange={(e) => setTextField("fullName", e.target.value)} />
        </label>
        <label className="field">
          <span>Email *</span>
          <input type="email" value={form.email} onChange={(e) => setTextField("email", e.target.value)} />
        </label>
        <label className="field field--wide">
          <span>Adres zamieszkania *</span>
          <input value={form.address} onChange={(e) => setTextField("address", e.target.value)} />
        </label>
        <label className="field">
          <span>Miasto *</span>
          <input value={form.city} onChange={(e) => setTextField("city", e.target.value)} />
        </label>
        <label className="field">
          <span>Kod pocztowy *</span>
          <input
            value={form.zip}
            onChange={(e) => setTextField("zip", formatPolishPostalCode(e.target.value))}
            inputMode="numeric"
            maxLength={6}
            placeholder="00-000"
          />
        </label>
        <label className="field">
          <span>Telefon *</span>
          <input value={form.phone} onChange={(e) => setTextField("phone", e.target.value)} />
        </label>
        <label className="field field--wide">
          <span>Adres lokalu *</span>
          <input value={form.propertyAddress} onChange={(e) => setTextField("propertyAddress", e.target.value)} />
        </label>
        <label className="field">
          <span>Miasto lokalu *</span>
          <input value={form.propertyCity} onChange={(e) => setTextField("propertyCity", e.target.value)} />
        </label>
        <label className="field">
          <span>Kod lokalu *</span>
          <input
            value={form.propertyZip}
            onChange={(e) => setTextField("propertyZip", formatPolishPostalCode(e.target.value))}
            inputMode="numeric"
            maxLength={6}
            placeholder="00-000"
          />
        </label>
      </div>
      <div className="wizard-nav">
        <span />
        <button className="btn-primary" onClick={saveAndGo}>
          Przejdź do podsumowania
        </button>
      </div>
    </div>
  );
}
