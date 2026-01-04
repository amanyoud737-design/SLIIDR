import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildPptx } from "@/lib/pptx";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pres = await prisma.presentation.findUnique({ where: { id: params.id } });
  if (!pres) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!pres.isPaid) return NextResponse.json({ error: "Not paid" }, { status: 402 });

  const template = pres.templateId
    ? await prisma.template.findUnique({ where: { id: pres.templateId } })
    : null;

  const buf = await buildPptx({
    title: pres.title,
    slides: pres.slides as any,
    template: template?.config
  });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(pres.title)}.pptx"`
    }
  });
}
