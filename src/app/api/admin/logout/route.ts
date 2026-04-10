import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  const res = NextResponse.json({ success: true });
  res.cookies.set("nbk_admin_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

