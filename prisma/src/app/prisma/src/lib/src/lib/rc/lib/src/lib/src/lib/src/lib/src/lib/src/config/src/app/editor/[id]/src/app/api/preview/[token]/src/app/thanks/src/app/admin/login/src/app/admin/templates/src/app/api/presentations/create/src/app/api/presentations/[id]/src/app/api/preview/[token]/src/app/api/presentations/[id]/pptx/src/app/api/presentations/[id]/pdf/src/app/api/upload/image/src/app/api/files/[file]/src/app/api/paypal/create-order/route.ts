import { NextResponse } from "next/server";
import { paypalAccessToken } from "@/lib/paypal";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { presentationId } = await req.json();
  const pres = await prisma.presentation.findUnique({ where: { id: presentationId } });
  if (!pres) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accessToken = await paypalAccessToken();
  const base = process.env.PAYPAL_BASE!;
  const amount = "9.99";
  const currency = "USD";

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ reference_id: presentationId, amount: { currency_code: currency, value: amount } }]
    })
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const data = await res.json();

  await prisma.payment.create({
    data: { presentationId, paypalOrderId: data.id, status: "CREATED", amount, currency }
  });

  return NextResponse.json({ id: data.id });
}
