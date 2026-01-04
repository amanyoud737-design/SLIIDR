"use client";

import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");

  async function createManual() {
    const res = await fetch("/api/presentations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    window.location.href = `/editor/${data.id}`;
  }

  async function createAI() {
    const ai = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const aiData = await ai.json();

    const res = await fetch("/api/presentations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const created = await res.json();

    await fetch(`/api/presentations/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: aiData.slides, title })
    });

    window.location.href = `/editor/${created.id}`;
  }

  return (
    <main className="container">
      <div className="card">
        <h1 style={{ fontSize: 34, margin: 0 }}>صانع عروض بوربوينت</h1>
        <p className="muted">اكتب العنوان، ثم اختر: تحرير يدوي أو توليد بالذكاء الاصطناعي.</p>

        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: الأمن السيبراني"
        />

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={createManual}>
            ابدأ تحرير يدوي
          </button>
          <button className="btn" onClick={createAI}>
            أنشئ بالذكاء الاصطناعي
          </button>

          <a className="btn" href="/admin/login" style={{ textDecoration: "none" }}>
            دخول الأدمن
          </a>
        </div>
      </div>
    </main>
  );
}
