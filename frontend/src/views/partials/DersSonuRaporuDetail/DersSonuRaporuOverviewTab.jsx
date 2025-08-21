import React, { useState, useMemo } from "react";

function line(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function fmtDate(iso) {
  try {
    return iso ? new Date(iso).toLocaleString("tr-TR") : "—";
  } catch {
    return String(iso || "—");
  }
}

function ExternalLink({ href, children }) {
  if (!href) return <span>—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children || href}
    </a>
  );
}

function KeyValue({ label, value }) {
  return (
    <div className="d-flex justify-content-between border-bottom py-1">
      <span className="text-muted">{label}</span>
      <span className="fw-semibold ms-3 text-break">{line(value)}</span>
    </div>
  );
}

export default function DersSonuRaporuOverviewTab({ derssonuraporu }) {
  const [showRaw, setShowRaw] = useState(false);

  const dr = derssonuraporu || {};
  const category = dr.category || {};
  const koordinator = dr.koordinator || {};
  const inserteduser = dr.inserteduser || {};
  const curriculum = Array.isArray(dr.curriculum) ? dr.curriculum : [];
  const lectures = Array.isArray(dr.lectures) ? dr.lectures : [];
  const questionAnswers = Array.isArray(dr.question_answers) ? dr.question_answers : [];

  const roles = useMemo(
    () => (Array.isArray(koordinator.roles) ? koordinator.roles : []),
    [koordinator.roles]
  );

  return (
    <div className="vstack gap-3">
      {/* Üst özet */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Genel Bilgiler</h5>
          <div className="row g-3">
            <div className="col-md-8">
              <div className="card border-0">
                <div className="card-body p-0">
                  <KeyValue label="ID" value={dr.id} />
                  <KeyValue label="Başlık" value={dr.title} />
                  <KeyValue label="Açıklama" value={dr.description} />
                  <KeyValue label="Dil" value={dr.language} />
                  <KeyValue label="Seviye" value={dr.level} />
                  <KeyValue label="Durum" value={dr.derssonuraporu_status} />
                  <KeyValue
                    label="Koordinatör Onayı"
                    value={dr.koordinator_derssonuraporu_status}
                  />
                  <KeyValue label="Tarih" value={fmtDate(dr.date)} />
                  <div className="d-flex justify-content-between border-bottom py-1">
                    <span className="text-muted">Dosya</span>
                    <span className="fw-semibold ms-3">
                      {dr.file ? <ExternalLink href={dr.file}>Dosyayı aç</ExternalLink> : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="border rounded p-2 text-center">
                {dr.image ? (
                  <img
                    src={dr.image}
                    alt={dr.title || "Görsel"}
                    className="img-fluid rounded"
                    style={{ maxHeight: 240, objectFit: "contain" }}
                  />
                ) : (
                  <div className="text-muted small">Görsel yok</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Kategori</h5>
          <KeyValue label="ID" value={category.id} />
          <KeyValue label="Başlık" value={category.title} />
          <KeyValue label="Slug" value={category.slug} />
          <KeyValue label="Aktif" value={category.active ? "Evet" : "Hayır"} />
          <div className="mt-2">
            <span className="text-muted me-2">Görsel:</span>
            {category.image ? (
              <ExternalLink href={category.image}>Görüntüle</ExternalLink>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* Koordinatör */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Koordinatör</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="border rounded p-2 text-center">
                {koordinator.image ? (
                  <img
                    src={koordinator.image}
                    alt={koordinator.full_name || "Koordinatör"}
                    className="img-fluid rounded"
                    style={{ maxHeight: 160, objectFit: "cover" }}
                  />
                ) : (
                  <div className="text-muted small">Görsel yok</div>
                )}
              </div>
            </div>
            <div className="col-md-9">
              <KeyValue label="ID" value={koordinator.id} />
              <KeyValue label="Ad Soyad" value={koordinator.full_name} />
              <KeyValue label="Bio" value={koordinator.bio} />
              <KeyValue label="Ülke" value={koordinator.country} />
              <div className="d-flex gap-3 flex-wrap my-2">
                <ExternalLink href={koordinator.facebook}>Facebook</ExternalLink>
                <ExternalLink href={koordinator.twitter}>Twitter</ExternalLink>
                <ExternalLink href={koordinator.linkedin}>LinkedIn</ExternalLink>
              </div>

              <div className="mt-2">
                <div className="text-muted mb-1">Roller</div>
                {roles.length ? (
                  <ul className="list-group">
                    {roles.map(r => (
                      <li key={r.id || r.name} className="list-group-item d-flex justify-content-between">
                        <span>{r.name}</span>
                        <span className="text-muted">#{r.id}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>—</div>
                )}
              </div>

              {/* Koordinatör -> kullanıcı */}
              <div className="mt-3">
                <div className="text-muted mb-1">Koordinatör Kullanıcısı</div>
                <KeyValue label="Kullanıcı ID" value={koordinator.user?.id} />
                <KeyValue label="Kullanıcı Adı" value={koordinator.user?.username} />
                <KeyValue label="Ad Soyad" value={koordinator.user?.full_name} />
                <KeyValue label="E-posta" value={koordinator.user?.email} />
                <KeyValue label="Kayıt" value={fmtDate(koordinator.user?.date_joined)} />
                <KeyValue label="Aktif" value={koordinator.user?.is_active ? "Evet" : "Hayır"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inserted User */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Kaydı Oluşturan Kullanıcı</h5>
          <KeyValue label="ID" value={inserteduser.id} />
          <KeyValue label="Kullanıcı Adı" value={inserteduser.username} />
          <KeyValue label="Ad Soyad" value={inserteduser.full_name} />
          <KeyValue label="E-posta" value={inserteduser.email} />
          <KeyValue label="Kayıt" value={fmtDate(inserteduser.date_joined)} />
          <KeyValue label="Aktif" value={inserteduser.is_active ? "Evet" : "Hayır"} />
        </div>
      </div>

      {/* Curriculum */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Curriculum</h5>
          {curriculum.length ? (
            <div className="vstack gap-3">
              {curriculum.map(variant => (
                <div key={variant.id} className="border rounded p-2">
                  <div className="d-flex justify-content-between">
                    <strong>{variant.title}</strong>
                    <small className="text-muted">
                      ID: {variant.id} • Variant ID: {line(variant.variant_id)} • {fmtDate(variant.date)}
                    </small>
                  </div>
                  <div className="mt-2">
                    <div className="text-muted">Öğeler</div>
                    {Array.isArray(variant.variant_items) && variant.variant_items.length ? (
                      <ul className="list-group">
                        {variant.variant_items.map(it => (
                          <li key={it.id} className="list-group-item">
                            <div className="d-flex justify-content-between">
                              <span className="fw-semibold">{line(it.title)}</span>
                              <small className="text-muted">#{it.id} • {fmtDate(it.date)}</small>
                            </div>
                            {it.description ? <div className="small text-muted mt-1">{it.description}</div> : null}
                            <div className="mt-1">
                              <span className="text-muted me-2">Dosya:</span>
                              {it.file ? <ExternalLink href={it.file}>Aç</ExternalLink> : "—"}
                            </div>
                            <div className="small text-muted mt-1">
                              variant_item_id: {line(it.variant_item_id)} • duration: {line(it.duration)} • content_duration: {line(it.content_duration)} • preview: {it.preview ? "Evet" : "Hayır"}
                            </div>
                            {it.variant ? (
                              <div className="small text-muted mt-1">
                                Variant: #{it.variant.id} — {it.variant.title} — {line(it.variant.variant_id)} — {fmtDate(it.variant.date)}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>—</div>
          )}
        </div>
      </div>

      {/* Lectures */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Lectures</h5>
          {lectures.length ? (
            <ul className="list-group">
              {lectures.map(lec => (
                <li key={lec.id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">{line(lec.title)}</span>
                    <small className="text-muted">#{lec.id} • {fmtDate(lec.date)}</small>
                  </div>
                  {lec.description ? <div className="small text-muted mt-1">{lec.description}</div> : null}
                  <div className="mt-1">
                    <span className="text-muted me-2">Dosya:</span>
                    {lec.file ? <ExternalLink href={lec.file}>Aç</ExternalLink> : "—"}
                  </div>
                  <div className="small text-muted mt-1">
                    variant_item_id: {line(lec.variant_item_id)} • duration: {line(lec.duration)} • content_duration: {line(lec.content_duration)} • preview: {lec.preview ? "Evet" : "Hayır"}
                  </div>
                  {lec.variant ? (
                    <div className="small text-muted mt-1">
                      Variant: #{lec.variant.id} — {lec.variant.title} — {line(lec.variant.variant_id)} — {fmtDate(lec.variant.date)}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div>—</div>
          )}
        </div>
      </div>

      {/* Soru-Cevap */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Soru-Cevap</h5>
          {questionAnswers.length ? (
            <div className="vstack gap-2">
              {questionAnswers.map(qa => (
                <div key={qa.id || qa.qa_id} className="border rounded p-2">
                  <div className="d-flex justify-content-between">
                    <strong>{line(qa.title) || "Başlık Yok"}</strong>
                    <small className="text-muted">
                      #{qa.id || qa.qa_id} • {fmtDate(qa.date)}
                    </small>
                  </div>
                  <div className="small text-muted mt-1">
                    Mesaj sayısı: {Array.isArray(qa.messages) ? qa.messages.length : 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>Henüz soru-cevap yok.</div>
          )}
        </div>
      </div>

      {/* Ham JSON */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Ham JSON</h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowRaw(s => !s)}
            >
              {showRaw ? "Gizle" : "Göster"}
            </button>
          </div>
          {showRaw && (
            <pre className="mt-3 mb-0 bg-light p-3 rounded" style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(dr, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
