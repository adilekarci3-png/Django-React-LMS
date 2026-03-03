import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import Modal from "react-bootstrap/Modal";
import moment from "moment";

import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

// ─── Örnek Veriler ───────────────────────────────────────────────────────────

const MOCK_ODEV_QAS = [
  {
    qa_id: 1,
    title: "React useEffect bağımlılık dizisi nasıl çalışır?",
    date: "2025-02-18T10:30:00",
    odev_title: "React Hooks Ödevi",
    source_id: 1,
    profile: { full_name: "Ahmet Yılmaz", image: "https://i.pravatar.cc/150?img=11" },
    messages: [
      {
        date: "2025-02-18T10:30:00",
        message: "Hocam, useEffect'in bağımlılık dizisine boş array yazınca sadece bir kez mi çalışır?",
        profile: { full_name: "Ahmet Yılmaz", image: "https://i.pravatar.cc/150?img=11" },
      },
      {
        date: "2025-02-18T11:05:00",
        message: "Evet, boş dizi [] verince component ilk mount olduğunda bir kez çalışır. Bağımlılık ekledikçe o değer değiştiğinde tekrar tetiklenir.",
        profile: { full_name: "Eğitmen Mehmet", image: "https://i.pravatar.cc/150?img=33" },
      },
    ],
  },
  {
    qa_id: 2,
    title: "useState ile obje güncellemesi yaparken spread operatörü şart mı?",
    date: "2025-02-20T14:15:00",
    odev_title: "React Hooks Ödevi",
    source_id: 1,
    profile: { full_name: "Zeynep Arslan", image: "https://i.pravatar.cc/150?img=5" },
    messages: [
      {
        date: "2025-02-20T14:15:00",
        message: "setState ile objeyi direkt değiştirince çalışmıyor, spread kullanmak zorunda mıyım?",
        profile: { full_name: "Zeynep Arslan", image: "https://i.pravatar.cc/150?img=5" },
      },
      {
        date: "2025-02-20T14:45:00",
        message: "Kesinlikle evet. React state immutable olmalı. Eski state'i spread ile kopyalayıp üzerine değişikliği yazman gerekiyor: setState(prev => ({ ...prev, alan: yeniDeger }))",
        profile: { full_name: "Eğitmen Mehmet", image: "https://i.pravatar.cc/150?img=33" },
      },
    ],
  },
  {
    qa_id: 3,
    title: "API çağrısını nereye yazmalıyım, component içi mi yoksa dışarıda mı?",
    date: "2025-02-22T09:00:00",
    odev_title: "Axios ile Veri Çekme Ödevi",
    source_id: 2,
    profile: { full_name: "Burak Demir", image: "https://i.pravatar.cc/150?img=15" },
    messages: [
      {
        date: "2025-02-22T09:00:00",
        message: "Ödevde axios çağrısını useEffect içinde mi yapmam gerekiyor yoksa dışarıda bir fonksiyon olarak mı tanımlamalıyım?",
        profile: { full_name: "Burak Demir", image: "https://i.pravatar.cc/150?img=15" },
      },
    ],
  },
];

const MOCK_KITAP_QAS = [
  {
    qa_id: 4,
    title: "Clean Code kitabında 'fonksiyon tek iş yapmalı' derken ne kastediliyor?",
    date: "2025-02-15T08:45:00",
    kitaptahlili_title: "Clean Code - Robert C. Martin",
    source_id: 1,
    profile: { full_name: "Selin Kaya", image: "https://i.pravatar.cc/150?img=9" },
    messages: [
      {
        date: "2025-02-15T08:45:00",
        message: "Kitapta fonksiyonların tek sorumluluk taşıması gerektiği yazıyor ama gerçek projede bunu nasıl uygulayacağımı anlayamadım.",
        profile: { full_name: "Selin Kaya", image: "https://i.pravatar.cc/150?img=9" },
      },
      {
        date: "2025-02-15T09:20:00",
        message: "Bunu şöyle düşün: fonksiyonun adı ne yapacağını tam açıklıyorsa ve sadece o işi yapıyorsa doğru yoldasın. 'getUserAndSendEmail' gibi bir isim görürsen o fonksiyon iki iş yapıyor demektir, ikiye bölmen gerekir.",
        profile: { full_name: "Eğitmen Ayşe", image: "https://i.pravatar.cc/150?img=44" },
      },
      {
        date: "2025-02-15T10:00:00",
        message: "Çok mantıklı açıkladınız, teşekkürler hocam!",
        profile: { full_name: "Selin Kaya", image: "https://i.pravatar.cc/150?img=9" },
      },
    ],
  },
  {
    qa_id: 5,
    title: "Atomic Habits'teki 1% kural yazılım geliştirmeye nasıl uygulanır?",
    date: "2025-02-19T16:30:00",
    kitaptahlili_title: "Atomic Habits - James Clear",
    source_id: 2,
    profile: { full_name: "Emre Şahin", image: "https://i.pravatar.cc/150?img=22" },
    messages: [
      {
        date: "2025-02-19T16:30:00",
        message: "Her gün %1 iyileşme fikrini kod yazarken nasıl pratiğe dökülebiliriz?",
        profile: { full_name: "Emre Şahin", image: "https://i.pravatar.cc/150?img=22" },
      },
      {
        date: "2025-02-19T17:10:00",
        message: "Her gün küçük bir refactor yap, bir test yaz ya da yeni bir kütüphane fonksiyonu öğren. Yılda 365 küçük adım seni çok farklı bir noktaya taşır.",
        profile: { full_name: "Eğitmen Ayşe", image: "https://i.pravatar.cc/150?img=44" },
      },
    ],
  },
];

const MOCK_DSR_QAS = [
  {
    qa_id: 6,
    title: "Derste anlatılan JWT yapısını raporuma nasıl dahil etmeliyim?",
    date: "2025-02-21T11:00:00",
    derssonuraporu_title: "Backend Güvenlik - JWT ve Auth Dersi",
    source_id: 1,
    profile: { full_name: "Merve Öztürk", image: "https://i.pravatar.cc/150?img=3" },
    messages: [
      {
        date: "2025-02-21T11:00:00",
        message: "Raporda JWT'yi sadece tanım olarak mı anlatayım yoksa kod örneği de koymam gerekiyor mu?",
        profile: { full_name: "Merve Öztürk", image: "https://i.pravatar.cc/150?img=3" },
      },
      {
        date: "2025-02-21T11:40:00",
        message: "Hem tanım hem de kısa bir kod örneği eklemen çok daha güçlü bir rapor oluşturur. Header, Payload ve Signature kısımlarını açıklamanı bekliyorum.",
        profile: { full_name: "Eğitmen Mehmet", image: "https://i.pravatar.cc/150?img=33" },
      },
    ],
  },
  {
    qa_id: 7,
    title: "Django REST Framework serializer hatası hakkında",
    date: "2025-02-23T13:20:00",
    derssonuraporu_title: "Django REST Framework Dersi",
    source_id: 2,
    profile: { full_name: "Can Yıldız", image: "https://i.pravatar.cc/150?img=17" },
    messages: [
      {
        date: "2025-02-23T13:20:00",
        message: "Derste gösterilen serializer örneğini uygulamaya çalışırken 'non_field_errors' hatası alıyorum, raporda bunu nasıl çözümledim diye yazacağım ama önce anlayamadım.",
        profile: { full_name: "Can Yıldız", image: "https://i.pravatar.cc/150?img=17" },
      },
    ],
  },
];

// ─── Sabitler ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "odev",         label: "Ödevler",             icon: "fas fa-tasks text-danger" },
  { key: "kitap",        label: "Kitap Tahlilleri",     icon: "fas fa-book text-primary" },
  { key: "dsr",          label: "Ders Sonu Raporları",  icon: "fas fa-file-alt text-secondary" },
];

// ─── Yardımcı: boş avatar ───────────────────────────────────────────────────

function Avatar({ src, size = 40 }) {
  const resolved = src?.startsWith("http") ? src : `http://127.0.0.1:8000${src}`;
  return (
    <img
      src={resolved}
      alt="avatar"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
    />
  );
}

// ─── Konuşma Modalı ─────────────────────────────────────────────────────────

function ConversationModal({ show, onHide, conversation, onSend, tab }) {
  const [message, setMessage] = useState("");
  const lastRef = useRef(null);

  useEffect(() => {
    if (lastRef.current) lastRef.current.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const title =
    tab === "odev"  ? conversation?.odev_title  :
    tab === "kitap" ? conversation?.kitaptahlili_title :
                      conversation?.derssonuraporu_title;

  return (
    <Modal show={show} size="lg" onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`${TABS.find(t => t.key === tab)?.icon} me-2`} />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border p-3 rounded-3">
          <ul
            className="list-unstyled mb-3"
            style={{ overflowY: "scroll", height: "420px" }}
          >
            {conversation?.messages?.map((m, i) => (
              <li key={i} className="mb-3">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <Avatar src={m.profile?.image} size={38} />
                  </div>
                  <div className="ms-2 flex-grow-1">
                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-0 fw-bold">
                        {m.profile?.full_name}
                        <span className="text-muted fw-normal ms-2" style={{ fontSize: 12 }}>
                          {moment(m.date).format("DD MMM YYYY, HH:mm")}
                        </span>
                      </h6>
                      <p className="mb-0 mt-2">{m.message}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <div ref={lastRef} />
          </ul>

          <form className="d-flex gap-2" onSubmit={handleSubmit}>
            <textarea
              className="form-control bg-light"
              rows={2}
              placeholder="Mesajınızı yazın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ whiteSpace: "nowrap" }}>
              Gönder <i className="fas fa-paper-plane ms-1" />
            </button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

// ─── QA Listesi ─────────────────────────────────────────────────────────────

function QAList({ items, onSelect, search, onSearch }) {
  return (
    <>
      <div className="card-header border-bottom p-3">
        <div className="position-relative">
          <input
            className="form-control pe-5 bg-transparent"
            type="search"
            placeholder="Başlıkta ara..."
            value={search}
            onChange={onSearch}
          />
          <i
            className="fas fa-search position-absolute text-muted"
            style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
          />
        </div>
      </div>

      <div className="card-body p-3">
        {items.length === 0 && (
          <div className="text-center text-muted py-5">
            <i className="fas fa-inbox fa-2x mb-2 d-block" />
            Henüz soru yok.
          </div>
        )}

        <div className="vstack gap-3">
          {items.map((q) => (
            <div key={q.qa_id} className="shadow-sm rounded-3 p-3 border">
              <div className="d-flex align-items-center mb-2">
                <Avatar src={q.profile?.image} size={48} />
                <div className="ms-2">
                  <h6 className="mb-0">{q.profile?.full_name}</h6>
                  <small className="text-muted">{moment(q.date).format("DD MMM YYYY")}</small>
                </div>
              </div>

              <h5 className="mb-1">
                {q.title}{" "}
                <span className="badge bg-primary ms-1">{q.messages?.length ?? 0}</span>
              </h5>

              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => onSelect(q)}
              >
                Konuşmaya Katıl <i className="fas fa-arrow-right ms-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

function QA() {
  const userId = UserData()?.user_id;
  const koordinatorId = UserData()?.teacher_id ?? UserData()?.user_id;

  const [activeTab, setActiveTab] = useState("odev");

  // Her tab için ayrı state
  const [odevQAs,  setOdevQAs]  = useState([]);
  const [kitapQAs, setKitapQAs] = useState([]);
  const [dsrQAs,   setDsrQAs]   = useState([]);

  const [searchOdev,  setSearchOdev]  = useState("");
  const [searchKitap, setSearchKitap] = useState("");
  const [searchDsr,   setSearchDsr]   = useState("");

  const [modal, setModal]               = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);

  // ── Veri çekme ──────────────────────────────────────────────────────────

  // Ödev QA listesi: her ödev için QA'ları çek
  const fetchOdevQAs = async () => {
    try {
      const res = await useAxios().get(`eskepinstructor/odev-list/${koordinatorId}/`);
      const odevler = res.data;

      const allQAs = await Promise.all(
        odevler.map(async (odev) => {
          try {
            const qaRes = await useAxios().get(
              `eskepinstructor/question-answer-list-create/${odev.odev_id}/`
            );
            return (qaRes.data ?? []).map((qa) => ({
              ...qa,
              odev_title: odev.title,
              source_id: odev.odev_id,
            }));
          } catch {
            return [];
          }
        })
      );
      const flat1 = allQAs.flat();
      setOdevQAs(flat1.length > 0 ? flat1 : MOCK_ODEV_QAS);
    } catch (e) {
      console.error("Ödev QA fetch error:", e);
      setOdevQAs(MOCK_ODEV_QAS);
    }
  };

  // Kitap Tahlili QA listesi
  const fetchKitapQAs = async () => {
    try {
      const res = await useAxios().get(`eskepinstructor/kitaptahlili-list/${koordinatorId}/`);
      const kitaplar = res.data;

      const allQAs = await Promise.all(
        kitaplar.map(async (kitap) => {
          try {
            const qaRes = await useAxios().get(
              `eskepinstructor/kitaptahlili-question-answer-list-create/${kitap.kitaptahlili_id}/`
            );
            return (qaRes.data ?? []).map((qa) => ({
              ...qa,
              kitaptahlili_title: kitap.title,
              source_id: kitap.kitaptahlili_id,
            }));
          } catch {
            return [];
          }
        })
      );
      const flat2 = allQAs.flat();
      setKitapQAs(flat2.length > 0 ? flat2 : MOCK_KITAP_QAS);
    } catch (e) {
      console.error("Kitap QA fetch error:", e);
      setKitapQAs(MOCK_KITAP_QAS);
    }
  };

  // Ders Sonu Raporu QA listesi
  const fetchDsrQAs = async () => {
    try {
      const res = await useAxios().get(`eskepinstructor/derssonuraporu-list/${koordinatorId}/`);
      const dsrler = res.data;

      const allQAs = await Promise.all(
        dsrler.map(async (dsr) => {
          try {
            const qaRes = await useAxios().get(
              `eskepinstructor/dsr-question-answer-list-create/${dsr.derssonuraporu_id}/`
            );
            return (qaRes.data ?? []).map((qa) => ({
              ...qa,
              derssonuraporu_title: dsr.title,
              source_id: dsr.derssonuraporu_id,
            }));
          } catch {
            return [];
          }
        })
      );
      const flat3 = allQAs.flat();
      setDsrQAs(flat3.length > 0 ? flat3 : MOCK_DSR_QAS);
    } catch (e) {
      console.error("DSR QA fetch error:", e);
      setDsrQAs(MOCK_DSR_QAS);
    }
  };

  useEffect(() => {
    fetchOdevQAs();
    fetchKitapQAs();
    fetchDsrQAs();
  }, []);

  // ── Mesaj gönder ────────────────────────────────────────────────────────

  const handleSend = async (message) => {
    if (!selectedConv) return;

    const formdata = new FormData();
    formdata.append("user_id", userId);
    formdata.append("message", message);
    formdata.append("qa_id", selectedConv.qa_id);

    let endpoint = "";
    if (activeTab === "odev") {
      formdata.append("odev_id", selectedConv.source_id);
      endpoint = `eskepinstructor/question-answer-message-create/`;
    } else if (activeTab === "kitap") {
      formdata.append("kitaptahlili_id", selectedConv.source_id);
      endpoint = `eskepinstructor/kitaptahlili-question-answer-message-create/`;
    } else {
      formdata.append("derssonuraporu_id", selectedConv.source_id);
      endpoint = `eskepinstructor/dsr-question-answer-message-create/`;
    }

    try {
      const res = await useAxios().post(endpoint, formdata);
      setSelectedConv(res.data.question ?? res.data);
    } catch (e) {
      console.error("Mesaj gönderme hatası:", e);
    }
  };

  // ── Arama filtresi ──────────────────────────────────────────────────────

  const filtered = (list, query) => {
    if (!query.trim()) return list;
    return list.filter((q) => q.title?.toLowerCase().includes(query.toLowerCase()));
  };

  // ── Tab içeriği ─────────────────────────────────────────────────────────

  const tabContent = {
    odev:  { items: filtered(odevQAs,  searchOdev),  search: searchOdev,  setSearch: setSearchOdev  },
    kitap: { items: filtered(kitapQAs, searchKitap), search: searchKitap, setSearch: setSearchKitap },
    dsr:   { items: filtered(dsrQAs,   searchDsr),   search: searchDsr,   setSearch: setSearchDsr   },
  };

  const current = tabContent[activeTab];

  return (
    <>
      <ESKEPBaseHeader />

      <section className="pt-5 pb-5">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12">
              <Sidebar />
            </div>

            <div className="col-lg-9 col-md-8 col-12">
              <h4 className="mb-3">
                <i className="fas fa-envelope me-2 text-primary" />
                Soru ve Cevap
              </h4>

              {/* Sekmeler */}
              <ul className="nav nav-tabs mb-0" style={{ borderBottom: "none" }}>
                {TABS.map((t) => (
                  <li className="nav-item" key={t.key}>
                    <button
                      className={`nav-link ${activeTab === t.key ? "active fw-semibold" : ""}`}
                      onClick={() => setActiveTab(t.key)}
                    >
                      <i className={`${t.icon} me-2`} />
                      {t.label}
                      <span className="badge bg-secondary ms-2">
                        {tabContent[t.key].items.length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="card" style={{ borderTopLeftRadius: 0 }}>
                <QAList
                  items={current.items}
                  search={current.search}
                  onSearch={(e) => current.setSearch(e.target.value)}
                  onSelect={(q) => { setSelectedConv(q); setModal(true); }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConversationModal
        show={modal}
        onHide={() => setModal(false)}
        conversation={selectedConv}
        onSend={handleSend}
        tab={activeTab}
      />

      <ESKEPBaseFooter />
    </>
  );
}

export default QA;