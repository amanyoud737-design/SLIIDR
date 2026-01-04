"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    const r = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!r.ok) {
      setErr("كلمة المرور غير صحيحة");
      return;
    }
    window.location.href = "/admin/templates";
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 520, margin: "60px auto" }}>
        <h1 style={{ margin: 0 }}>دخول الأدمن</h1>
        <p className="muted">هذه الصفحة خاصة فيك.</p>

        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ height: 10 }} />
        <button className="btn btnPrimary" onClick={login}>دخول</button>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </div>
    </main>
  );
}
