import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const expectedUser = process.env.ADMIN_BASIC_USER;
    const expectedPass = process.env.ADMIN_BASIC_PASS;

    if (!expectedUser || !expectedPass) {
      return NextResponse.json({ error: "Brak konfiguracji logowania admina." }, { status: 500 });
    }

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json({ error: "Nieprawidlowy login lub haslo." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("nbk_admin_session", "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Blad serwera." }, { status: 500 });
  }
}

