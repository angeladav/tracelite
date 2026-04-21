import { NextRequest, NextResponse } from "next/server";
import type { PlanType } from "@tracelite/common";

type OrganizationResponse = {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  createdAt: Date;
  updatedAt: Date;
};

type CreateOrganizationPayload = {
  name?: string;
  slug?: string;
};

export async function GET(req: NextRequest) {
  const apiBase = process.env.TRACELITE_API_URL;

  if (!apiBase) {
    return NextResponse.json(
      { message: "Server misconfigured: missing TRACELITE_API_URL" },
      { status: 500 },
    );
  }

  const token = req.cookies.get("tl_access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${apiBase}/v1/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = (await upstream
      .json()
      .catch(() => ({}))) as Partial<OrganizationResponse[]> & {
      message?: string | string[];
    };

    if (!upstream.ok) {
      return NextResponse.json({ message:"Failed to fetch organizations" }, { status: upstream.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Failed to reach API service" },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const apiBase = process.env.TRACELITE_API_URL;

  if (!apiBase) {
    return NextResponse.json(
      { message: "Server misconfigured: missing TRACELITE_API_URL" },
      { status: 500 },
    );
  }

  const token = req.cookies.get("tl_access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: CreateOrganizationPayload;
  try {
    payload = (await req.json()) as CreateOrganizationPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const name = payload.name?.trim();
  if (!name) {
    return NextResponse.json(
      { message: "Organization name is required" },
      { status: 400 },
    );
  }

  const slug =
    payload.slug?.trim() ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  try {
    const upstream = await fetch(`${apiBase}/v1/organizations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, slug }),
      cache: "no-store",
    });

    const data = (await upstream
      .json()
      .catch(() => ({}))) as { message?: string | string[] };

    if (!upstream.ok) {
      return NextResponse.json({ message: 'Failed to create organization' }, { status: upstream.status });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to reach API service" },
      { status: 502 },
    );
  }
}