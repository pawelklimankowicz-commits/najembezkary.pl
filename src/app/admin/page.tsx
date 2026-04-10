import { getSupabaseServerClient } from "@/lib/supabase-server";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

type ClientSubmission = {
  id: string;
  submitted_at: string;
  email: string;
  owner_phone: string;
  owner_name: string;
  owner_city: string;
  property_city: string;
  property_address: string;
  property_type: string;
  rental_platform: string[] | null;
  rental_since: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let rows: ClientSubmission[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("client_submissions")
      .select(
        "id, submitted_at, email, owner_phone, owner_name, owner_city, property_city, property_address, property_type, rental_platform, rental_since"
      )
      .order("submitted_at", { ascending: false })
      .limit(300);

    if (error) {
      errorMessage = error.message;
    } else {
      rows = (data ?? []) as ClientSubmission[];
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Nieznany blad";
  }

  return (
    <main className="page-shell" style={{ maxWidth: "1100px", paddingTop: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
        <AdminLogoutButton />
      </div>
      <h1 className="page-title">Panel admina — klienci z formularza</h1>
      <p className="page-intro">
        Ostatnie zapisy z formularza na stronie. Widok chroniony hasłem Basic Auth.
      </p>

      {errorMessage ? (
        <p className="wizard-error" role="alert">
          Blad odczytu danych: {errorMessage}
        </p>
      ) : null}

      <div className="table-wrap">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Wlasciciel</th>
              <th>Lokal</th>
              <th>Typ</th>
              <th>Platformy</th>
              <th>Rok</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>Brak danych.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.submitted_at).toLocaleString("pl-PL")}</td>
                  <td>{row.email}</td>
                  <td>{row.owner_phone}</td>
                  <td>
                    {row.owner_name}
                    <br />
                    <small>{row.owner_city}</small>
                  </td>
                  <td>
                    {row.property_address}
                    <br />
                    <small>{row.property_city}</small>
                  </td>
                  <td>{row.property_type}</td>
                  <td>{Array.isArray(row.rental_platform) ? row.rental_platform.join(", ") : "-"}</td>
                  <td>{row.rental_since ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

