import { NextResponse } from "next/server";

import { buildDocumentsZipBuffer } from "@/lib/build-documents-zip";
import {
  orderDocumentInputSchema,
  toOrderDocumentBuildInput,
} from "@/lib/order-input-schema";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe JSON" }, { status: 400 });
  }

  const parsed = orderDocumentInputSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] || "Nieprawidłowe dane formularza";
    return NextResponse.json({ error: msg, fieldErrors: first }, { status: 400 });
  }

  try {
    const buf = await buildDocumentsZipBuffer(
      toOrderDocumentBuildInput(parsed.data)
    );
    const filename = `najembezkary_dokumenty_${new Date().toISOString().slice(0, 10)}.zip`;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Nie udało się wygenerować paczki. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
