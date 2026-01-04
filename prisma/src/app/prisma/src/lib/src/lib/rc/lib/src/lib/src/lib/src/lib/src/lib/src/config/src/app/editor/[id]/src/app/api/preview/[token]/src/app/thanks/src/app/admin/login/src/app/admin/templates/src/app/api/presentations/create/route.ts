import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const title = (body?.title || "عرض جديد").toString();

  const previewToken = crypto.randomBytes(24).toString("hex");

  const slides = [
    {
      bgColor: "FFFFFF",
      items: [
        { type: "title", text: title, font: "Noto Naskh Arabic", fontSize: 36 },
        { type: "bullets", items: ["اكتب نقاطك هنا"], font: "Noto Naskh Arabic", fontSize: 22 }
      ]
    }
  ];

  const pres = await prisma.presentation.create({
    data: { title, slides, previewToken }
  });

  return NextResponse.json({ id: pres.id });
}
