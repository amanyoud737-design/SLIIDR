import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const pres = await prisma.presentation.findFirst({ where: { previewToken: params.token } });
  if (!pres) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pres);
}
