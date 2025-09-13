// src/pages/Contact.jsx
import React, { useMemo, useState } from "react";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";

export default function Contact() {
  const css = `
  :root{
    --ink:#0b1220; --text:#0e1726; --muted:#475569; --line:#cbd5e1; --subtle:#f8fafc;
    --pri-900:#0e7490; --pri-700:#0891b2; --pri-600:#06b6d4; --pri-500:#22d3ee; --pri-300:#67e8f9;
    --sec-700:#7c3aed; --sec-500:#a78bfa; --acc-500:#f43f5e;
    --radius-xl:26px; --radius-lg:18px; --radius-md:12px;
    --shadow-xl:0 24px 50px rgba(2,6,23,.22); --shadow-lg:0 16px 34px rgba(2,6,23,.18); --shadow-md:0 10px 24px rgba(2,6,23,.12);
    --container:1400px;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial; color:var(--text); background:#fff}

  .outer{padding:0}
  .page{max-width:100%;margin:0;border-radius:0;overflow:hidden;background:#fff}

  .content{padding:48px 40px;background:linear-gradient(180deg,var(--subtle),#fff)}
  .container{max-width:var(--container);margin:0 auto}
  .grid{display:grid;gap:36px}
  @media(min-width:1100px){.grid{grid-template-columns:1.1fr .9fr}}

  .card{background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow-lg)}
  .card-header{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;background:linear-gradient(90deg,#e0f2fe,#fff)}
  .card-title{margin:0;font-size:19px;font-weight:900;color:var(--ink)}
  .card-body{padding:24px}

  .row{display:grid;gap:16px}
  @media(min-width:680px){.row-2{grid-template-columns:1fr 1fr}}
  .field{position:relative}
  .field input,.field select,.field textarea{width:100%;padding:22px 14px 10px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);outline:none;transition:box-shadow .15s,border-color .15s,font-weight .15s;font-size:15px}
  .field textarea{min-height:160px;resize:vertical;padding-top:26px}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--pri-600); box-shadow:0 0 0 5px rgba(6,182,212,.22); font-weight:500}
  .label{position:absolute;left:12px;top:12px;color:var(--muted);font-size:13px;transition:all .15s;background:#fff;padding:0 6px;border-radius:8px}
  .field input:focus + .label,.field input:not(:placeholder-shown) + .label,
  .field textarea:focus + .label,.field textarea:not(:placeholder-shown) + .label,
  .field select:focus + .label{top:-9px;font-size:11px;color:var(--pri-700)}
  .error{font-size:12px;color:#b91c1c;margin-top:6px}

  .actions{display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:18px}
  .btn{display:inline-flex;align-items:center;gap:8px;border:1px solid transparent;border-radius:12px;padding:13px 18px;font-weight:800;cursor:pointer;transition:all .15s}
  .btn-primary{background:linear-gradient(90deg,var(--pri-600),var(--sec-700));color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(6,182,212,.3)}
  .btn-primary:hover{filter:brightness(.97)}
  .btn-ghost{background:#fff;border-color:var(--line);color:var(--text)}
  .btn-ghost:hover{background:var(--subtle)}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.5);border-top-color:#fff;border-radius:50%;animation:spin .9s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  .alert{padding:12px 14px;border-radius:12px;border:1px solid}
  .alert-success{background:#ecfeff;border-color:#7dd3fc;color:#075985}
  .alert-error{background:#fef2f2;border-color:#fecaca;color:#7f1d1d}

  .info-list{display:grid;gap:14px}
  .info-item{display:flex;gap:14px;align-items:flex-start}
  .info-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#bae6fd,#ddd6fe);color:#1e1b4b;font-weight:900;border:1px solid #ddd6fe;box-shadow:0 4px 10px rgba(0,0,0,.06)}
  .info-link{color:var(--pri-700);text-decoration:none;font-weight:500}
  .map{border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-md)}
  .ratio{position:relative;width:100%;padding-top:56.25%}
  .ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  `;

  const initial = useMemo(() => ({ name: "", email: "", phone: "", subject: "Genel", message: "" }), []);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ad Soyad zorunludur.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Geçerli bir e-posta giriniz.";
    if (form.phone && !/^\+?\d[\d\s\-]{7,}$/.test(form.phone)) e.phone = "Telefon formatı hatalı.";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Lütfen en az 10 karakter yazınız.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setOk(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("İstek başarısız: " + res.status);
      setOk(true);
      setForm(initial);
      setErrors({});
    } catch (err) {
      console.error(err);
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <AkademiBaseHeader />

      <div className="outer">
        <main className="page">
          <section className="content">
            <div className="container grid">
              <div className="card">
                <div className="card-header">
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--pri-600)" }} />
                  <h2 className="card-title">Mesaj Gönder</h2>
                </div>
                <form className="card-body" noValidate onSubmit={onSubmit}>
                  {ok === true && <div className="alert alert-success">Mesajınız alındı.</div>}
                  {ok === false && <div className="alert alert-error">Bir hata oluştu.</div>}

                  <div className="row row-2">
                    <div className="field">
                      <input id="name" placeholder=" " value={form.name} onChange={(e) => set("name", e.target.value)} />
                      <label htmlFor="name" className="label">Ad Soyad</label>
                      {errors.name && <div className="error">{errors.name}</div>}
                    </div>
                    <div className="field">
                      <input id="email" type="email" placeholder=" " value={form.email} onChange={(e) => set("email", e.target.value)} />
                      <label htmlFor="email" className="label">E-posta</label>
                      {errors.email && <div className="error">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="row row-2">
                    <div className="field">
                      <input id="phone" placeholder=" " value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                      <label htmlFor="phone" className="label">Telefon</label>
                      {errors.phone && <div className="error">{errors.phone}</div>}
                    </div>
                    <div className="field">
                      <select id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
                        <option>Genel</option>
                        <option>Eğitim / Kurs</option>
                        <option>Gönüllülük</option>
                        <option>Bağış</option>
                        <option>İş Birliği</option>
                        <option>Diğer</option>
                      </select>
                      <label htmlFor="subject" className="label">Konu</label>
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <textarea id="message" placeholder=" " value={form.message} onChange={(e) => set("message", e.target.value)} />
                      <label htmlFor="message" className="label">Mesajınız</label>
                      {errors.message && <div className="error">{errors.message}</div>}
                    </div>
                  </div>

                  <div className="actions">
                    <button type="button" className="btn btn-ghost" onClick={() => { setForm(initial); setErrors({}); setOk(null); }}>Temizle</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <span className="spinner"/> : "Gönder"}</button>
                  </div>
                </form>
              </div>

              <div className="grid" style={{ gap: 36 }}>
                <div className="card">
                  <div className="card-header">
                    <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--sec-700)" }} />
                    <h2 className="card-title">İletişim Bilgilerimiz</h2>
                  </div>
                  <div className="card-body">
                    <div className="info-list">
                      <div className="info-item"><div className="info-icon">📍</div><div>GMK Bulvarı No: XX, Çankaya / Ankara</div></div>
                      <div className="info-item"><div className="info-icon">✉️</div><div><a className="info-link" href="mailto:bilgi@ehad.org.tr">bilgi@ehad.org.tr</a></div></div>
                      <div className="info-item"><div className="info-icon">📞</div><div><a className="info-link" href="tel:+903123240034">+90 312 324 00 34</a></div></div>
                      <div className="info-item"><div className="info-icon">⏰</div><div>Pzt–Cum: 09:00–18:00</div></div>
                      <div className="info-item"><div className="info-icon">🌐</div><div><a className="info-link" href="https://www.ehad.org.tr/">ehad.org.tr</a></div></div>
                    </div>
                  </div>
                </div>

                <div className="card map">
                  <div className="card-header">
                    <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--pri-500)" }} />
                    <h2 className="card-title">Harita</h2>
                  </div>
                  <div className="card-body">
                    <div className="ratio"><iframe title="Konum" loading="lazy" allowFullScreen src="https://www.google.com/maps?q=Ankara&output=embed"/></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
