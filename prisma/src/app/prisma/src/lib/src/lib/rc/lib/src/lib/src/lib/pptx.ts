import PptxGenJS from "pptxgenjs";
import { publicUrlToDiskPath } from "@/lib/storage";

type SlideItem =
  | { type: "title"; text: string; font: string; fontSize: number }
  | { type: "bullets"; items: string[]; font: string; fontSize: number }
  | { type: "image"; url: string; x: number; y: number; w: number; h: number };

type Slide = { bgColor?: string; items: SlideItem[] };

function safeFont(f: string) {
  return f || "Calibri";
}

function urlToImagePath(url: string) {
  const disk = publicUrlToDiskPath(url);
  if (disk) return disk;
  return url; // fallback
}

export async function buildPptx(opts: { title: string; slides: Slide[]; template?: any }) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  for (const s of opts.slides) {
    const slide = pptx.addSlide();

    const bgColor = s.bgColor || opts.template?.bgColor || "FFFFFF";
    slide.background = { color: bgColor };

    const bgImageUrl = opts.template?.bgImageUrl as string | undefined;
    if (bgImageUrl) {
      slide.addImage({ path: urlToImagePath(bgImageUrl), x: 0, y: 0, w: 13.333, h: 7.5 });
    }

    let cursorY = 0.8;

    for (const item of s.items) {
      if (item.type === "title") {
        slide.addText(item.text, {
          x: 0.8,
          y: cursorY,
          w: 11.8,
          h: 0.8,
          fontFace: safeFont(item.font),
          fontSize: item.fontSize,
          bold: true,
          align: "right",
          rtl: true,
          color: opts.template?.textColor || "111111"
        });
        cursorY += 1.0;
      }

      if (item.type === "bullets") {
        const text = item.items.map((x) => `• ${x}`).join("\n");
        slide.addText(text, {
          x: 0.9,
          y: cursorY,
          w: 11.6,
          h: 4.8,
          fontFace: safeFont(item.font),
          fontSize: item.fontSize,
          align: "right",
          rtl: true,
          color: opts.template?.textColor || "111111"
        });
        cursorY += 4.8;
      }

      if (item.type === "image") {
        slide.addImage({
          path: urlToImagePath(item.url),
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        });
      }
    }
  }

  const file = await pptx.write("nodebuffer");
  return file as Buffer;
}
