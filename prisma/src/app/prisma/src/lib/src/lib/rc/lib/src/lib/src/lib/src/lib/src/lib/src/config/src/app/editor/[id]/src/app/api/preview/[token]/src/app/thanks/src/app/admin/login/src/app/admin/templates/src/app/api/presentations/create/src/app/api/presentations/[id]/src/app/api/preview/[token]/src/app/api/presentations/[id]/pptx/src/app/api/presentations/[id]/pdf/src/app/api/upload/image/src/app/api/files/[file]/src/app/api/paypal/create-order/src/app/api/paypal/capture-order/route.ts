import { NextResponse } from "next/server";
import { paypalAccessToken } from "@/lib/paypal";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { orderID } = await req.json();

  const pay = await prisma.payment.findUnique({ where: { paypalOrderId: orderID } });
  if (!pay) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const accessToken = await paypalAccessToken();
  const base = process.env.PAYPAL_BASE!;

  const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
  });

  const data = await res.json();

  if (!res.ok) {
    await prisma.payment.update({ where: { paypalOrderId: orderID }, data: { status: "FAILED" } });
    return NextResponse.json({ error: data }, { status: 500 });
  }

  await prisma.payment.update({ where: { paypalOrderId: orderID }, data: { status: "CAPTURED" } });
  await prisma.presentation.update({ where: { id: pay.presentationId }, data: { isPaid: true } });

  return NextResponse.json({ ok: true, presentationId: pay.presentationId });
}
