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

export function DataForm() {
  const router = useRouter();
  const [form, setForm] = useState<OwnerDataState>(initial);
  const [error, setError] = useState("");

  function saveAndGo() {
    if (!form.fullName || !form.email || !form.address || !form.propertyAddress) {
      setError("Uzupelnij wymagane pola.");
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
          <span>Imie i nazwisko *</span>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </label>
        <label className="field">
          <span>Email *</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field field--wide">
          <span>Adres zamieszkania *</span>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="field">
          <span>Miasto *</span>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="field">
          <span>Kod pocztowy *</span>
          <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
        </label>
        <label className="field">
          <span>Telefon *</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="field field--wide">
          <span>Adres lokalu *</span>
          <input
            value={form.propertyAddress}
            onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Miasto lokalu *</span>
          <input value={form.propertyCity} onChange={(e) => setForm({ ...form, propertyCity: e.target.value })} />
        </label>
        <label className="field">
          <span>Kod lokalu *</span>
          <input value={form.propertyZip} onChange={(e) => setForm({ ...form, propertyZip: e.target.value })} />
        </label>
      </div>
      <div className="wizard-nav">
        <span />
        <button className="btn-primary" onClick={saveAndGo}>
          Przejdz do podsumowania
        </button>
      </div>
    </div>
  );
}
