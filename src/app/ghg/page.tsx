"use client";

import { FormEvent, useMemo, useState } from "react";

type ApiState = { ok: boolean; message: string };

type ReportListItem = {
  id: string;
  report_year: number;
  company_name: string;
  status: string;
  created_at: string;
  approved_at: string | null;
};

function toMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "OK";
  const error = (data as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) return error;
  return "OK";
}

export default function GhgPanelPage() {
  const [orgId, setOrgId] = useState("");
  const [userId, setUserId] = useState("");
  const [apiState, setApiState] = useState<ApiState | null>(null);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [billingInfo, setBillingInfo] = useState<string>("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-org-id": orgId,
      "x-user-id": userId,
    }),
    [orgId, userId]
  );

  async function callApi(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const data = (await response.json().catch(() => ({}))) as unknown;
    if (!response.ok) {
      throw new Error(toMessage(data));
    }
    return data;
  }

  async function onTenantBootstrap(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const data = (await callApi("/api/ghg/tenants/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(fd.get("userId") || ""),
          organizationName: String(fd.get("organizationName") || ""),
          countryCode: String(fd.get("countryCode") || "PL"),
          email: String(fd.get("email") || ""),
          planCode: String(fd.get("planCode") || "starter"),
        }),
      })) as { organizationId?: string };
      if (data.organizationId) setOrgId(data.organizationId);
      setUserId(String(fd.get("userId") || ""));
      setApiState({ ok: true, message: `Tenant utworzony. organizationId=${data.organizationId ?? "-"}` });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd bootstrap." });
    }
  }

  async function onCreateLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi("/api/ghg/locations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: String(fd.get("name") || ""),
          countryCode: String(fd.get("countryCode") || "PL"),
          city: String(fd.get("city") || ""),
          addressLine: String(fd.get("addressLine") || ""),
        }),
      });
      setApiState({ ok: true, message: "Lokalizacja dodana." });
      e.currentTarget.reset();
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd lokalizacji." });
    }
  }

  async function onCreateSource(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi("/api/ghg/sources", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sourceKey: String(fd.get("sourceKey") || ""),
          sourceName: String(fd.get("sourceName") || ""),
          scope: String(fd.get("scope") || "scope1"),
          method: String(fd.get("method") || ""),
          defaultActivityUnit: String(fd.get("defaultActivityUnit") || ""),
        }),
      });
      setApiState({ ok: true, message: "Źródło emisji dodane." });
      e.currentTarget.reset();
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd źródła emisji." });
    }
  }

  async function onCreatePeriod(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi("/api/ghg/periods", {
        method: "POST",
        headers,
        body: JSON.stringify({
          label: String(fd.get("label") || ""),
          periodStart: String(fd.get("periodStart") || ""),
          periodEnd: String(fd.get("periodEnd") || ""),
        }),
      });
      setApiState({ ok: true, message: "Okres raportowy dodany." });
      e.currentTarget.reset();
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd okresu raportowego." });
    }
  }

  async function onGenerateReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await callApi("/api/ghg/reports", {
        method: "POST",
        headers,
        body: JSON.stringify({
          organizationId: orgId,
          reportingPeriodId: String(fd.get("reportingPeriodId") || ""),
          reportYear: Number(fd.get("reportYear") || "2025"),
          companyName: String(fd.get("companyName") || ""),
          inventoryBoundary: String(fd.get("inventoryBoundary") || "operational_control"),
          consolidationApproach: String(fd.get("consolidationApproach") || "market_based"),
          activities: [
            {
              sourceKey: String(fd.get("sourceKey") || "pl_grid_electricity_market"),
              sourceName: String(fd.get("sourceName") || "Energy"),
              scope: String(fd.get("scope") || "scope2"),
              method: String(fd.get("method") || "purchased_electricity"),
              periodStart: `${String(fd.get("periodStart") || "2025-01-01")}T00:00:00.000Z`,
              periodEnd: `${String(fd.get("periodEnd") || "2025-12-31")}T23:59:59.000Z`,
              activityAmount: Number(fd.get("activityAmount") || "0"),
              activityUnit: String(fd.get("activityUnit") || "kWh"),
              emissionFactor: Number(fd.get("emissionFactor") || "0"),
              emissionFactorUnit: String(fd.get("emissionFactorUnit") || "kgCO2e/kWh"),
              uncertaintyPct: Number(fd.get("uncertaintyPct") || "0"),
            },
          ],
        }),
      });
      setApiState({ ok: true, message: "Raport wygenerowany i zapisany jako draft." });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd generacji raportu." });
    }
  }

  async function refreshReports() {
    try {
      const data = (await callApi("/api/ghg/reports", {
        method: "GET",
        headers,
      })) as { reports?: ReportListItem[] };
      const items = data.reports ?? [];
      setReports(items);
      if (!selectedReportId && items[0]?.id) setSelectedReportId(items[0].id);
      setApiState({ ok: true, message: `Pobrano raporty: ${items.length}.` });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd pobrania raportów." });
    }
  }

  async function runWorkflow(action: "submit_for_review" | "request_changes" | "approve") {
    if (!selectedReportId) {
      setApiState({ ok: false, message: "Wybierz reportId." });
      return;
    }
    try {
      await callApi("/api/ghg/reports/workflow", {
        method: "POST",
        headers,
        body: JSON.stringify({
          reportId: selectedReportId,
          action,
          comment: action === "request_changes" ? "Brakuje danych źródłowych." : "OK",
        }),
      });
      setApiState({ ok: true, message: `Workflow wykonany: ${action}.` });
      await refreshReports();
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd workflow." });
    }
  }

  async function exportReportZip() {
    if (!selectedReportId) {
      setApiState({ ok: false, message: "Wybierz reportId do eksportu." });
      return;
    }
    try {
      const response = await fetch(`/api/ghg/reports/${selectedReportId}/export`, {
        method: "GET",
        headers: {
          "x-org-id": orgId,
          "x-user-id": userId,
        },
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as unknown;
        throw new Error(toMessage(data));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghg_report_${selectedReportId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setApiState({ ok: true, message: "Eksport ZIP (JSON/PDF/XLSX) gotowy." });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd eksportu." });
    }
  }

  async function syncFactors() {
    try {
      await callApi("/api/ghg/factors/sync", { method: "POST", headers });
      setApiState({ ok: true, message: "Emission factors zsynchronizowane." });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd synchronizacji factorów." });
    }
  }

  async function loadBilling() {
    try {
      const data = (await callApi("/api/ghg/billing", {
        method: "GET",
        headers,
      })) as { billing?: { plan_code?: string; subscription_status?: string; stripe_customer_id?: string } | null };
      if (!data.billing) {
        setBillingInfo("Brak konta billingowego dla organizacji.");
      } else {
        setBillingInfo(
          `Plan: ${data.billing.plan_code ?? "-"}, status: ${data.billing.subscription_status ?? "-"}, customer: ${data.billing.stripe_customer_id ?? "-"}`
        );
      }
      setApiState({ ok: true, message: "Pobrano billing." });
    } catch (error) {
      setApiState({ ok: false, message: error instanceof Error ? error.message : "Błąd pobrania billingu." });
    }
  }

  return (
    <main className="page-shell">
      <h1 className="page-title">Scopeo GHG SaaS Panel</h1>
      <p className="page-intro">
        Panel operacyjny do obsługi pełnego cyklu GHG Protocol: tenant, dane wejściowe, raportowanie, workflow i eksport.
      </p>

      <section className="landing-section">
        <h2>Kontekst sesji</h2>
        <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <label>organizationId<input value={orgId} onChange={(e) => setOrgId(e.target.value)} /></label>
          <label>userId<input value={userId} onChange={(e) => setUserId(e.target.value)} /></label>
        </div>
        {apiState ? <p style={{ color: apiState.ok ? "green" : "crimson" }}>{apiState.message}</p> : null}
      </section>

      <section className="landing-section">
        <h2>1) Tenant setup + billing</h2>
        <form onSubmit={onTenantBootstrap} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <input name="organizationName" placeholder="Organization name" required />
          <input name="userId" placeholder="Owner user id" required />
          <input name="email" type="email" placeholder="billing email" required />
          <input name="countryCode" defaultValue="PL" />
          <select name="planCode" defaultValue="starter">
            <option value="starter">starter</option>
            <option value="growth">growth</option>
            <option value="enterprise">enterprise</option>
          </select>
          <button type="submit">Utwórz tenant</button>
        </form>
        <p>
          <button type="button" onClick={loadBilling}>Odśwież billing</button>
        </p>
        <p>{billingInfo}</p>
      </section>

      <section className="landing-section">
        <h2>2) Struktura danych (lokalizacje, źródła, okresy)</h2>
        <form onSubmit={onCreateLocation} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <strong>Nowa lokalizacja</strong>
          <input name="name" placeholder="Nazwa lokalizacji" required />
          <input name="city" placeholder="Miasto" />
          <input name="addressLine" placeholder="Adres" />
          <input name="countryCode" defaultValue="PL" />
          <button type="submit">Dodaj lokalizację</button>
        </form>
        <form onSubmit={onCreateSource} style={{ display: "grid", gap: 8, maxWidth: 640, marginTop: 16 }}>
          <strong>Nowe źródło emisji</strong>
          <input name="sourceKey" placeholder="source_key" required />
          <input name="sourceName" placeholder="Nazwa źródła" required />
          <select name="scope" defaultValue="scope2">
            <option value="scope1">scope1</option>
            <option value="scope2">scope2</option>
            <option value="scope3">scope3</option>
          </select>
          <input name="method" defaultValue="purchased_electricity" required />
          <input name="defaultActivityUnit" defaultValue="kWh" required />
          <button type="submit">Dodaj źródło</button>
        </form>
        <form onSubmit={onCreatePeriod} style={{ display: "grid", gap: 8, maxWidth: 640, marginTop: 16 }}>
          <strong>Nowy okres raportowy</strong>
          <input name="label" defaultValue="FY2025" required />
          <input name="periodStart" type="date" required />
          <input name="periodEnd" type="date" required />
          <button type="submit">Dodaj okres</button>
        </form>
      </section>

      <section className="landing-section">
        <h2>3) Official factors (KOBiZE/DEFRA/IEA)</h2>
        <button type="button" onClick={syncFactors}>Synchronizuj official factors</button>
      </section>

      <section className="landing-section">
        <h2>4) Raport + workflow + eksport</h2>
        <form onSubmit={onGenerateReport} style={{ display: "grid", gap: 8, maxWidth: 740 }}>
          <input name="reportingPeriodId" placeholder="reportingPeriodId (UUID)" required />
          <input name="companyName" placeholder="Company name" required />
          <input name="reportYear" type="number" defaultValue={2025} />
          <select name="inventoryBoundary" defaultValue="operational_control">
            <option value="operational_control">operational_control</option>
            <option value="financial_control">financial_control</option>
            <option value="equity_share">equity_share</option>
          </select>
          <select name="consolidationApproach" defaultValue="market_based">
            <option value="market_based">market_based</option>
            <option value="location_based">location_based</option>
          </select>
          <input name="sourceKey" defaultValue="pl_grid_electricity_market" />
          <input name="sourceName" defaultValue="Electricity consumption" />
          <select name="scope" defaultValue="scope2">
            <option value="scope1">scope1</option>
            <option value="scope2">scope2</option>
            <option value="scope3">scope3</option>
          </select>
          <input name="method" defaultValue="purchased_electricity" />
          <input name="periodStart" type="date" required />
          <input name="periodEnd" type="date" required />
          <input name="activityAmount" type="number" step="0.0001" defaultValue={1000} />
          <input name="activityUnit" defaultValue="kWh" />
          <input name="emissionFactor" type="number" step="0.0001" defaultValue={0.698} />
          <input name="emissionFactorUnit" defaultValue="kgCO2e/kWh" />
          <input name="uncertaintyPct" type="number" step="0.01" defaultValue={5} />
          <button type="submit">Generuj raport (draft)</button>
        </form>

        <p style={{ marginTop: 12 }}>
          <button type="button" onClick={refreshReports}>Odśwież listę raportów</button>
        </p>
        <select
          value={selectedReportId}
          onChange={(e) => setSelectedReportId(e.target.value)}
          style={{ minWidth: 560, maxWidth: "100%" }}
        >
          <option value="">Wybierz raport</option>
          {reports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.company_name} | {report.report_year} | {report.status} | {report.id}
            </option>
          ))}
        </select>
        <p style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button type="button" onClick={() => runWorkflow("submit_for_review")}>Submit for review</button>
          <button type="button" onClick={() => runWorkflow("request_changes")}>Request changes</button>
          <button type="button" onClick={() => runWorkflow("approve")}>Approve</button>
          <button type="button" onClick={exportReportZip}>Eksport ZIP</button>
        </p>
      </section>
    </main>
  );
}
