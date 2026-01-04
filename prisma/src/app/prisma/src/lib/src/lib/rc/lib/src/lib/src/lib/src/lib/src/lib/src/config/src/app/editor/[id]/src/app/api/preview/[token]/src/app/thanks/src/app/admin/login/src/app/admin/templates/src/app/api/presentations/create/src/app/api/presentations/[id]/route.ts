import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pres = await prisma.presentation.findUnique({ where: { id: params.id } });
  if (!pres) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pres);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const pres = await prisma.presentation.update({
    where: { id: params.id },
    data: {
      title: body?.title,
      slides: body?.slides,
      templateId: body?.templateId ?? null
    }
  });

  return NextResponse.json(pres);
}
