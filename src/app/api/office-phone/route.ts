import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FindPlaceResponse = {
  candidates?: Array<{ place_id?: string }>;
  status?: string;
  error_message?: string;
};

type PlaceDetailsResponse = {
  result?: { formatted_phone_number?: string; formatted_address?: string };
  status?: string;
  error_message?: string;
};

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      phone: null,
      address: null,
      warning: "Brak GOOGLE_MAPS_API_KEY. Nie można pobrać danych urzędu z Google.",
    });
  }

  let body: { officeName?: string; officeAddress?: string | null; city?: string | null };
  try {
    body = (await req.json()) as {
      officeName?: string;
      officeAddress?: string | null;
      city?: string | null;
    };
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane wejściowe." }, { status: 400 });
  }

  const query = [body.officeName, body.officeAddress, body.city, "Polska"]
    .filter((v) => (v ?? "").toString().trim().length > 0)
    .join(", ");

  if (!query) {
    return NextResponse.json({ error: "Brak danych urzędu do wyszukania." }, { status: 400 });
  }

  try {
    const findUrl =
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" +
      `?input=${encodeURIComponent(query)}` +
      "&inputtype=textquery&fields=place_id&language=pl&region=pl" +
      `&key=${encodeURIComponent(apiKey)}`;

    const findRes = await fetch(findUrl, { cache: "no-store" });
    const findJson = (await findRes.json()) as FindPlaceResponse;
    const placeId = findJson.candidates?.[0]?.place_id;
    if (!placeId) {
      return NextResponse.json({ phone: null, address: null });
    }

    const detailsUrl =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      "&fields=formatted_phone_number,formatted_address&language=pl&region=pl" +
      `&key=${encodeURIComponent(apiKey)}`;

    const detailsRes = await fetch(detailsUrl, { cache: "no-store" });
    const detailsJson = (await detailsRes.json()) as PlaceDetailsResponse;

    return NextResponse.json({
      phone: detailsJson.result?.formatted_phone_number ?? null,
      address: detailsJson.result?.formatted_address ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd pobierania danych urzędu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
