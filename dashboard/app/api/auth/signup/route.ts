import { NextRequest, NextResponse } from "next/server";

type SignupResponse = {
  access_token: string;
};

export async function POST(req: NextRequest) {
  const apiBase = process.env.TRACELITE_API_URL;

  if (!apiBase) {
    return NextResponse.json(
      { message: "Server misconfigured: missing TRACELITE_API_URL" },
      { status: 500 },
    );
  }

  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const upstream = await fetch(`${apiBase}/v1/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
    cache: "no-store",
  });

  const data = (await upstream.json().catch(() => ({}))) as Partial<SignupResponse> & {
    message?: string | string[];
  };

  if (!upstream.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message ?? "Signup failed";
    return NextResponse.json({ message }, { status: upstream.status });
  }

  if (!data.access_token) {
    return NextResponse.json(
      { message: "Signup succeeded but no token returned" },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("tl_access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}