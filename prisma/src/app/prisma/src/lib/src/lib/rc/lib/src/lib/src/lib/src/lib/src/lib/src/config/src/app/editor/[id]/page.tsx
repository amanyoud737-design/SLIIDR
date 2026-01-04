"use client";

import { useEffect, useMemo, useState } from "react";
import SlideThumbnails from "@/components/SlideThumbnails";
import SlideStage from "@/components/SlideStage";
import Toolbar from "@/components/Toolbar";

function defaultSlide(title: string) {
  return {
    bgColor: "FFFFFF",
    items: [
      { type: "title", text: title || "عنوان الشريحة", font: "Noto Naskh Arabic", fontSize: 36 },
      { type: "bullets", items: ["اكتب نقاطك هنا"], font: "Noto Naskh Arabic", fontSize: 22 }
    ]
  };
}

function applyLayout(slide: any, layout: string) {
  const next = structuredClone(slide);

  if (layout === "TITLE_BULLETS") {
    // لا شيء إضافي
    return next;
  }

  if (layout === "TITLE_IMAGE") {
    // صورة كبيرة تحت
    next.items = next.items.filter((x: any) => x.type !== "image");
    next.items.push({ type: "image", url: "", x: 520, y: 180, w: 360, h: 260 });
    return next;
  }

  if (layout === "FULL_IMAGE") {
    next.items = next.items.filter((x: any) => x.type !== "image");
    next.items.push({ type: "image", url: "", x: 40, y: 40, w: 880, h: 460 });
    // عنوان أصغر
    const t = next.items.find((x: any) => x.type === "title");
    if (t) t.fontSize = 28;
    return next;
  }

  return next;
}

export default function EditorPage({ params }: { params: { id: string } }) {
  const [pres, setPres] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [active, setActive] = useState(0);
  const [busyUpload, setBusyUpload] = useState(false);

  useEffect(() => {
    async function boot() {
      const p = await fetch(`/api/presentations/${params.id}`).then((r) => r.json());
      setPres(p);

      const t = await fetch("/api/admin/templates").then((r) => r.json());
      setTemplates(t);

      if (p.templateId) {
        const found = t.find((x: any) => x.id === p.templateId);
        setTemplate(found || null);
      }
    }
    boot();
  }, [params.id]);

  const slides = pres?.slides || [];
  const slide = slides[active];

  async function save(nextPres: any) {
    setPres(nextPres);
    await fetch(`/api/presentations/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nextPres.title,
        slides: nextPres.slides,
        templateId: nextPres.templateId
      })
    });
  }

  async function updateSlide(nextSlide: any) {
    const next = structuredClone(pres);
    next.slides[active] = nextSlide;
    await save(next);
  }

  async function addSlide() {
    const next = structuredClone(pres);
    next.slides.push(defaultSlide("عنوان الشريحة"));
    await save(next);
    setActive(next.slides.length - 1);
  }

  async function removeSlide() {
    if (slides.length <= 1) return;
    const next = structuredClone(pres);
    next.slides.splice(active, 1);
    await save(next);
    setActive(Math.max(0, active - 1));
  }

  async function changeTemplateId(templateId: string | null) {
    const found = templates.find((x: any) => x.id === templateId) || null;
    setTemplate(found);

    const next = structuredClone(pres);
    next.templateId = templateId;
    await save(next);
  }

  const previewUrl = useMemo(() => {
    if (!pres?.previewToken) return "#";
    return `${window.location.origin}/preview/${pres.previewToken}`;
  }, [pres?.previewToken]);

  if (!pres) return <main className="container">...تحميل</main>;
  if (!slide) return <main className="container">لا توجد شرائح</main>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ borderLeft: "1px solid #eee", padding: 14, overflow: "auto", background: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{pres.title}</div>
        <div className="muted" style={{ marginTop: 6 }}>
          <a href={previewUrl} target="_blank" rel="noreferrer">فتح المعاينة</a>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btnPrimary" onClick={addSlide}>+ شريحة</button>
          <button className="btn" onClick={removeSlide}>حذف</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <SlideThumbnails slides={slides} template={template} active={active} onSelect={setActive} />
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="btn btnPrimary" onClick={() => (window.location.href = `/pay/${pres.id}`)}>
            الانتقال للدفع
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="container" style={{ overflow: "auto" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>تحرير الشريحة {active + 1}</h2>
          <div className="row">
            <a className="btn" href={previewUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              معاينة
            </a>
            <a className="btn" href={`/pay/${pres.id}`} style={{ textDecoration: "none" }}>
              دفع/تنزيل
            </a>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <Toolbar
          slide={slide}
          template={template}
          templates={templates}
          presentationTemplateId={pres.templateId}
          onChangeTemplateId={changeTemplateId}
          onUpdateSlide={updateSlide}
          onApplyLayout={(layout: string) => updateSlide(applyLayout(slide, layout))}
        />

        <div style={{ height: 12 }} />

        {/* رفع صورة من الجهاز */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 900 }}>إضافة صورة</div>
              <div className="muted">ترفع من جهازك وتظهر فورًا وتدخل في التصدير.</div>
            </div>

            <label className="btn" style={{ display: "inline-block" }}>
              {busyUpload ? "جاري الرفع..." : "اختر صورة"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                disabled={busyUpload}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;

                  setBusyUpload(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", f);
                    const r = await fetch("/api/upload/image", { method: "POST", body: fd });
                    const d = await r.json();
                    if (!r.ok) {
                      alert(d?.error || "فشل رفع الصورة");
                      return;
                    }

                    const next = structuredClone(slide);
                    // افتراضيًا نضيفها بحجم معقول داخل المسرح (px)
                    next.items.push({
                      type: "image",
                      url: d.url,
                      x: 520,
                      y: 220,
                      w: 320,
                      h: 220
                    });
                    await updateSlide(next);

                    (e.target as HTMLInputElement).value = "";
                  } finally {
                    setBusyUpload(false);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {/* المسرح (مع سحب/تكبير الصور) */}
        <SlideStage slide={slide} template={template} onUpdateSlide={updateSlide} width={960} />
      </main>
    </div>
  );
}
