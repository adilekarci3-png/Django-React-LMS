// src/pages/Contact.jsx
import React, { useEffect, useMemo, useState } from "react";
import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";

export default function Contact() {
  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

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

  .contact-page .cp-outer{padding:0}
  .contact-page .cp-page{max-width:100%;margin:0;border-radius:0;overflow:hidden;background:#fff}

  /* --- Hero Banner --- */
  .contact-page .cp-hero{background:linear-gradient(135deg,var(--pri-900),var(--sec-700));padding:48px 20px 40px;text-align:center}
  .contact-page .cp-hero-title{margin:0 0 8px;font-size:clamp(22px,5vw,36px);font-weight:900;color:#fff;letter-spacing:-.5px}
  .contact-page .cp-hero-sub{margin:0;font-size:clamp(13px,3vw,16px);color:rgba(255,255,255,.75)}

  .contact-page .cp-content{padding:48px 40px;background:linear-gradient(180deg,var(--subtle),#fff)}
  .contact-page .cp-container{max-width:var(--container);margin:0 auto}
  .contact-page .cp-grid{display:grid;gap:36px}
  @media(min-width:1100px){.contact-page .cp-grid{grid-template-columns:1.1fr .9fr}}

  .contact-page .cp-card{background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow-lg)}
  .contact-page .cp-card-header{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;background:linear-gradient(90deg,#e0f2fe,#fff)}
  .contact-page .cp-card-title{margin:0;font-size:19px;font-weight:900;color:var(--ink)}
  .contact-page .cp-card-body{padding:24px}

  .contact-page .cp-row{display:grid;gap:16px}
  @media(min-width:680px){.contact-page .cp-row-2{grid-template-columns:1fr 1fr}}
  .contact-page .cp-field{position:relative}
  .contact-page .cp-field input,
  .contact-page .cp-field select,
  .contact-page .cp-field textarea{width:100%;padding:22px 14px 10px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);outline:none;transition:box-shadow .15s,border-color .15s,font-weight .15s;font-size:15px}
  .contact-page .cp-field textarea{min-height:160px;resize:vertical;padding-top:26px}
  .contact-page .cp-field input:focus,
  .contact-page .cp-field select:focus,
  .contact-page .cp-field textarea:focus{border-color:var(--pri-600);box-shadow:0 0 0 5px rgba(6,182,212,.22);font-weight:500}
  .contact-page .cp-label{position:absolute;left:12px;top:12px;color:var(--muted);font-size:13px;transition:all .15s;background:#fff;padding:0 6px;border-radius:8px}
  .contact-page .cp-field input:focus + .cp-label,
  .contact-page .cp-field input:not(:placeholder-shown) + .cp-label,
  .contact-page .cp-field textarea:focus + .cp-label,
  .contact-page .cp-field textarea:not(:placeholder-shown) + .cp-label,
  .contact-page .cp-field select:focus + .cp-label{top:-9px;font-size:11px;color:var(--pri-700)}
  .contact-page .cp-error{font-size:12px;color:#b91c1c;margin-top:6px}

  .contact-page .cp-actions{display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}
  .contact-page .cp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:12px;padding:13px 18px;font-weight:800;cursor:pointer;transition:all .15s}
  .contact-page .cp-btn-primary{background:linear-gradient(90deg,var(--pri-600),var(--sec-700));color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(6,182,212,.3)}
  .contact-page .cp-btn-primary:hover{filter:brightness(.97)}
  .contact-page .cp-btn-ghost{background:#fff;border-color:var(--line);color:var(--text)}
  .contact-page .cp-btn-ghost:hover{background:var(--subtle)}
  .contact-page .cp-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.5);border-top-color:#fff;border-radius:50%;animation:cp-spin .9s linear infinite}
  @keyframes cp-spin{to{transform:rotate(360deg)}}

  .contact-page .cp-alert{padding:12px 14px;border-radius:12px;border:1px solid;margin-bottom:14px;font-size:14px}
  .contact-page .cp-alert-success{background:#ecfeff;border-color:#7dd3fc;color:#075985}
  .contact-page .cp-alert-error{background:#fef2f2;border-color:#fecaca;color:#7f1d1d}

  .contact-page .cp-info-list{display:grid;gap:14px}
  .contact-page .cp-info-item{display:flex;gap:14px;align-items:flex-start}
  .contact-page .cp-info-icon{width:42px;height:42px;min-width:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#bae6fd,#ddd6fe);color:#1e1b4b;font-weight:900;border:1px solid #ddd6fe;box-shadow:0 4px 10px rgba(0,0,0,.06)}
  .contact-page .cp-info-link{color:var(--pri-700);text-decoration:none;font-weight:500;word-break:break-all}
  .contact-page .cp-map{border-radius:22px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-md)}
  .contact-page .cp-ratio{position:relative;width:100%;padding-top:56.25%}
  .contact-page .cp-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .contact-page .cp-right-col{gap:36px}

  /* ===== TABLET (max 1099px) ===== */
  @media(max-width:1099px){
    .contact-page .cp-content{padding:36px 24px}
    .contact-page .cp-grid{gap:24px}
    .contact-page .cp-right-col{gap:24px}
  }

  /* ===== MOBILE (max 679px) ===== */
  @media(max-width:679px){
    .contact-page .cp-hero{padding:32px 16px 28px}
    .contact-page .cp-content{padding:20px 12px}
    .contact-page .cp-grid{gap:16px}
    .contact-page .cp-card{border-radius:16px}
    .contact-page .cp-card-header{padding:14px 16px;gap:10px}
    .contact-page .cp-card-title{font-size:16px}
    .contact-page .cp-card-body{padding:16px 14px}
    .contact-page .cp-row{gap:12px}
    .contact-page .cp-field input,
    .contact-page .cp-field select,
    .contact-page .cp-field textarea{font-size:16px;padding:20px 12px 9px}
    .contact-page .cp-field textarea{min-height:130px;padding-top:24px}
    .contact-page .cp-actions{flex-direction:column;gap:10px;margin-top:14px}
    .contact-page .cp-btn{width:100%;padding:14px 16px;font-size:15px}
    .contact-page .cp-btn-ghost{display:none}
    .contact-page .cp-info-icon{width:36px;height:36px;min-width:36px;font-size:15px}
    .contact-page .cp-info-list{gap:12px}
    .contact-page .cp-info-item{gap:12px}
    .contact-page .cp-ratio{padding-top:65%}
    .contact-page .cp-right-col{gap:16px}
  }

  /* ===== VERY SMALL (max 359px) ===== */
  @media(max-width:359px){
    .contact-page .cp-content{padding:16px 10px}
    .contact-page .cp-card-body{padding:12px 10px}
    .contact-page .cp-card-title{font-size:15px}
  }
  `;

  const initial = useMemo(
    () => ({ name: "", email: "", phone: "", subject: "", message: "" }),
    []
  );
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    async function fetchSubjects() {
      setSubjectsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/contact/subjects/`);
        if (!res.ok) throw new Error("Konu listesi alınamadı");
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) setForm((s) => ({ ...s, subject: String(data[0].id) }));
      } catch (err) {
        console.error(err);
        setSubjectsError("Konu listesi yüklenemedi.");
      } finally {
        setSubjectsLoading(false);
      }
    }
    fetchSubjects();
  }, [API_BASE]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ad Soyad zorunludur.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Geçerli bir e-posta giriniz.";
    if (form.phone && !/^\+?\d[\d\s\-]{7,}$/.test(form.phone)) e.phone = "Telefon formatı hatalı.";
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Lütfen en az 10 karakter yazınız.";
    if (!form.subject) e.subject = "Lütfen bir konu seçiniz.";
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
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject ? Number(form.subject) : null,
        message: form.message,
      };
      const res = await fetch(`${API_BASE}/api/v1/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("İstek başarısız: " + res.status);
      setOk(true);
      setForm({ ...initial, subject: subjects.length ? String(subjects[0].id) : "" });
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
      <HomeHeader />

      <div className="contact-page">
        <div className="cp-outer">
          <main className="cp-page">
            <div className="cp-hero">
              <h1 className="cp-hero-title">Bizimle İletişime Geçin</h1>
              <p className="cp-hero-sub">Sorularınız için bize ulaşın, en kısa sürede dönüş yapalım.</p>
            </div>
            <section className="cp-content">
              <div className="cp-container cp-grid">

                {/* Sol: Form */}
                <div className="cp-card">
                  <div className="cp-card-header">
                    <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--pri-600)" }} />
                    <h2 className="cp-card-title">Mesaj Gönder</h2>
                  </div>
                  <form className="cp-card-body" noValidate onSubmit={onSubmit}>
                    {ok === true && <div className="cp-alert cp-alert-success">Mesajınız alındı.</div>}
                    {ok === false && <div className="cp-alert cp-alert-error">Bir hata oluştu.</div>}

                    <div className="cp-row cp-row-2">
                      <div className="cp-field">
                        <input id="name" placeholder=" " value={form.name} onChange={(e) => set("name", e.target.value)} />
                        <label htmlFor="name" className="cp-label">Ad Soyad</label>
                        {errors.name && <div className="cp-error">{errors.name}</div>}
                      </div>
                      <div className="cp-field">
                        <input id="email" type="email" placeholder=" " value={form.email} onChange={(e) => set("email", e.target.value)} />
                        <label htmlFor="email" className="cp-label">E-posta</label>
                        {errors.email && <div className="cp-error">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="cp-row cp-row-2">
                      <div className="cp-field">
                        <input id="phone" placeholder=" " value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                        <label htmlFor="phone" className="cp-label">Telefon</label>
                        {errors.phone && <div className="cp-error">{errors.phone}</div>}
                      </div>
                      <div className="cp-field">
                        <select id="subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} disabled={subjectsLoading || subjectsError}>
                          {subjectsLoading && <option>Yükleniyor...</option>}
                          {subjectsError && <option value="">Konu yüklenemedi</option>}
                          {!subjectsLoading && !subjectsError && subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <label htmlFor="subject" className="cp-label">Konu</label>
                        {errors.subject && <div className="cp-error">{errors.subject}</div>}
                      </div>
                    </div>

                    <div className="cp-row">
                      <div className="cp-field">
                        <textarea id="message" placeholder=" " value={form.message} onChange={(e) => set("message", e.target.value)} />
                        <label htmlFor="message" className="cp-label">Mesajınız</label>
                        {errors.message && <div className="cp-error">{errors.message}</div>}
                      </div>
                    </div>

                    <div className="cp-actions">
                      <button
                        type="button"
                        className="cp-btn cp-btn-ghost"
                        onClick={() => {
                          setForm(subjects.length ? { ...initial, subject: String(subjects[0].id) } : initial);
                          setErrors({});
                          setOk(null);
                        }}
                      >
                        Temizle
                      </button>
                      <button type="submit" className="cp-btn cp-btn-primary" disabled={loading}>
                        {loading ? <span className="cp-spinner" /> : "Gönder"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sağ: Bilgi + Harita */}
                <div className="cp-grid cp-right-col">
                  <div className="cp-card">
                    <div className="cp-card-header">
                      <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--sec-700)" }} />
                      <h2 className="cp-card-title">İletişim Bilgilerimiz</h2>
                    </div>
                    <div className="cp-card-body">
                      <div className="cp-info-list">
                        <div className="cp-info-item">
                          <div className="cp-info-icon">📍</div>
                          <div>GMK Bulvarı No: XX, Çankaya / Ankara</div>
                        </div>
                        <div className="cp-info-item">
                          <div className="cp-info-icon">✉️</div>
                          <div><a className="cp-info-link" href="mailto:bilgi@ehad.org.tr">bilgi@egitimportali.com</a></div>
                        </div>
                        <div className="cp-info-item">
                          <div className="cp-info-icon">📞</div>
                          <div><a className="cp-info-link" href="tel:+903123240034">+90 312 324 00 34</a></div>
                        </div>
                        <div className="cp-info-item">
                          <div className="cp-info-icon">⏰</div>
                          <div>Pzt–Cum: 09:00–18:00</div>
                        </div>
                        <div className="cp-info-item">
                          <div className="cp-info-icon">🌐</div>
                          <div><a className="cp-info-link" href="https://www.ehad.org.tr/">egitimportali.com</a></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="cp-card cp-map">
                    <div className="cp-card-header">
                      <div style={{ width: 12, height: 12, borderRadius: 999, background: "var(--pri-500)" }} />
                      <h2 className="cp-card-title">Harita</h2>
                    </div>
                    <div className="cp-card-body">
                      <div className="cp-ratio">
                        <iframe
                          title="Konum"
                          loading="lazy"
                          allowFullScreen
                          src="https://www.google.com/maps?q=Ankara&output=embed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </main>
        </div>
      </div>

      <HomeFooter />
    </>
  );
}