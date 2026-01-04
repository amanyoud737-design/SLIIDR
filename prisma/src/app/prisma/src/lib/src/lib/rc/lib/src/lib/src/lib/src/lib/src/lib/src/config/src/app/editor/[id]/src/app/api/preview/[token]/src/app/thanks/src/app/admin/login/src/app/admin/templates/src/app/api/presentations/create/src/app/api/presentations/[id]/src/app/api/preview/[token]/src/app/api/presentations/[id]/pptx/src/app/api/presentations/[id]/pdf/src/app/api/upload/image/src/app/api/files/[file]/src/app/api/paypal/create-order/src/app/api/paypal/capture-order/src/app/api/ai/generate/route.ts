import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { title } = await req.json();

  const prompt = `
أنشئ عرض بوربوينت عربي احترافي بعنوان: "${title}"
أريد JSON فقط بهذه الصيغة:
{
  "slides":[
    {"bgColor":"FFFFFF","items":[
      {"type":"title","text":"...","font":"Noto Naskh Arabic","fontSize":36},
      {"type":"bullets","items":["...","..."],"font":"Noto Naskh Arabic","fontSize":22}
    ]}
  ]
}
اجعل عدد الشرائح 6-8.
`;

  const r = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    input: prompt
  });

  const text = r.output_text?.trim() || "";
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "AI returned non-JSON", raw: text }, { status: 500 });
  }
}
