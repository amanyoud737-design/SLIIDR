"use client";

import { useEffect, useState } from "react";

export default function TemplatesPage() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#111111");
  const [bgImageUrl, setBgImageUrl] = useState("");

  async function load() {
    const r = await fetch("/api/admin/templates");
    setList(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function uploadBg(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload/image", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d?.error || "Upload failed");
    return d.url as string;
  }

  async function add() {
    const r = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        config: {
          bgColor: bgColor.replace("#", ""),
          textColor: textColor.replace("#", ""),
          bgImageUrl: bgImageUrl || null
        }
      })
    });

    if (!r.ok) {
      alert("غير مصرح. سجل دخول أدمن.");
      return;
    }

    setName("");
    setBgImageUrl("");
    await load();
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ margin: 0 }}>القوالب</h1>
        <p className="muted">أنشئ قوالب جاهزة للطلاب (ألوان + خلفية صورة).</p>

        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="muted">اسم القالب</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ minWidth: 160 }}>
            <label className="muted">لون الخلفية</label>
            <input className="input" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </div>

          <div style={{ minWidth: 160 }}>
            <label className="muted">لون النص</label>
            <input className="input" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          </div>

          <div style={{ minWidth: 240 }}>
            <label className="muted">خلفية صورة (اختياري)</label>
            <input
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const url = await uploadBg(f);
                  setBgImageUrl(url);
                } catch (err: any) {
                  alert(err?.message || "فشل رفع الصورة");
                } finally {
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            {bgImageUrl && <div className="muted">تم رفع الخلفية ✅</div>}
          </div>

          <button className="btn btnPrimary" onClick={add}>إضافة القالب</button>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gap: 10 }}>
        {list.map((t) => (
          <div key={t.id} className="card">
            <b>{t.name}</b>
            <div className="muted">{JSON.stringify(t.config)}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
