"use client";

import {
  type OwnerDraft,
  type PropertyDraft,
  formatPolishPostalCode,
  PROPERTY_TYPE_LABELS,
} from "@/lib/wizard-draft";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

type PatchOwner = <K extends keyof OwnerDraft>(
  idx: number,
  key: K,
  value: OwnerDraft[K]
) => void;

type PatchProperty = <K extends keyof PropertyDraft>(
  idx: number,
  key: K,
  value: PropertyDraft[K]
) => void;

export function OwnerDataStep({
  owners,
  patchOwner,
  copyOwnerFromFirst,
}: {
  owners: OwnerDraft[];
  patchOwner: PatchOwner;
  copyOwnerFromFirst: (idx: number) => void;
}) {
  return (
    <section className="wizard-panel">
      <h2>Dane właściciela</h2>
      {owners.map((owner, idx) => (
        <div key={`owner-${idx}`} className="wizard-multi-block">
          <div className="wizard-multi-head">
            <h3>Właściciel nr {idx + 1}</h3>
            {idx > 0 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copyOwnerFromFirst(idx)}
              >
                Skopiuj dane właściciela nr 1
              </button>
            ) : null}
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Imię i nazwisko</span>
              <input
                value={owner.owner_name}
                onChange={(e) => patchOwner(idx, "owner_name", e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="field">
              <span>Ulica i numer</span>
              <input
                value={owner.owner_address}
                onChange={(e) => patchOwner(idx, "owner_address", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Miejscowość</span>
              <input
                value={owner.owner_city}
                onChange={(e) => patchOwner(idx, "owner_city", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Kod pocztowy</span>
              <input
                value={owner.owner_zip}
                onChange={(e) =>
                  patchOwner(idx, "owner_zip", formatPolishPostalCode(e.target.value))
                }
                inputMode="numeric"
                maxLength={6}
                placeholder="00-000"
              />
            </label>
            <label className="field">
              <span>Telefon</span>
              <input
                value={owner.owner_phone}
                onChange={(e) => patchOwner(idx, "owner_phone", e.target.value)}
                placeholder="+48 501234567"
              />
            </label>
            <label className="field">
              <span>Adres e-mail</span>
              <input
                type="email"
                value={owner.email}
                onChange={(e) => patchOwner(idx, "email", e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>PESEL</span>
              <input
                value={owner.owner_pesel}
                onChange={(e) => patchOwner(idx, "owner_pesel", e.target.value)}
              />
            </label>
            <label className="field field--wide">
              <span>Dowód osobisty (seria i numer)</span>
              <input
                value={owner.owner_identity_document}
                onChange={(e) =>
                  patchOwner(idx, "owner_identity_document", e.target.value)
                }
              />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}

export function PropertyDataStep({
  properties,
  patchProperty,
  copyPropertyFromFirst,
}: {
  properties: PropertyDraft[];
  patchProperty: PatchProperty;
  copyPropertyFromFirst: (idx: number) => void;
}) {
  return (
    <section className="wizard-panel">
      <h2>Obiekt do rejestracji</h2>
      {properties.map((property, idx) => (
        <div key={`property-${idx}`} className="wizard-multi-block">
          <div className="wizard-multi-head">
            <h3>Lokal nr {idx + 1}</h3>
            {idx > 0 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copyPropertyFromFirst(idx)}
              >
                Skopiuj dane z lokalu nr 1
              </button>
            ) : null}
          </div>
          <div className="field-grid">
            <label className="field field--wide">
              <span>Adres obiektu (ulica, numer)</span>
              <input
                value={property.property_address}
                onChange={(e) => patchProperty(idx, "property_address", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Kod pocztowy</span>
              <input
                value={property.property_zip}
                onChange={(e) =>
                  patchProperty(idx, "property_zip", formatPolishPostalCode(e.target.value))
                }
                inputMode="numeric"
                maxLength={6}
                placeholder="00-000"
              />
            </label>
            <label className="field">
              <span>Miejscowość</span>
              <input
                value={property.property_city}
                onChange={(e) => patchProperty(idx, "property_city", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Rodzaj lokalu</span>
              <select
                value={property.property_type}
                onChange={(e) =>
                  patchProperty(
                    idx,
                    "property_type",
                    e.target.value as OrderDocumentFormInput["property_type"]
                  )
                }
              >
                {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Powierzchnia użytkowa (m²)</span>
              <input
                type="number"
                min={1}
                step={0.1}
                value={property.property_area ?? ""}
                onChange={(e) =>
                  patchProperty(
                    idx,
                    "property_area",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </label>
            {property.property_type !== "dom" ? (
              <label className="field">
                <span>Piętro (opcjonalnie)</span>
                <input
                  type="number"
                  step={1}
                  value={property.property_floor ?? ""}
                  onChange={(e) =>
                    patchProperty(
                      idx,
                      "property_floor",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </label>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
