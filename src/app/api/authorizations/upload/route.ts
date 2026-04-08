import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Brak konfiguracji wysyłki e-mail (RESEND_API_KEY)." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const city = String(formData.get("city") ?? "").trim();
    const propertyCount = String(formData.get("propertyCount") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nie przesłano pliku." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Dozwolone formaty pliku: PDF, JPG, PNG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Plik jest zbyt duży. Maksymalny rozmiar to 10 MB." },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const bytes = new Uint8Array(await file.arrayBuffer());

    await resend.emails.send({
      from: "najembezkary.pl <kontakt@najembezkary.pl>",
      to: ["kontakt@najembezkary.pl"],
      subject: "Nowe pełnomocnictwo do zarządzania lokalem/lokalami",
      html: `<div style="font-family:Arial,sans-serif;max-width:640px">
        <h2>Przesłano plik pełnomocnictwa</h2>
        <p><strong>Nazwa pliku:</strong> ${file.name}</p>
        <p><strong>Miasto/gmina:</strong> ${city || "brak danych"}</p>
        <p><strong>Liczba lokali:</strong> ${propertyCount || "brak danych"}</p>
      </div>`,
      attachments: [
        {
          filename: file.name,
          content: bytes,
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd wysyłki pliku.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
