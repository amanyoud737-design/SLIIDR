import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pres = await prisma.presentation.findUnique({ where: { id: params.id } });
  if (!pres) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!pres.isPaid) return NextResponse.json({ error: "Not paid" }, { status: 402 });

  return new NextResponse(
    `PDF export not enabled yet. PPTX ready: /api/presentations/${params.id}/pptx`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
