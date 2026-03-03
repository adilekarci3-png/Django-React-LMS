import { useState, useEffect } from "react";
import moment from "moment";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import { teacherId } from "../../utils/constants";
import Toast from "../plugin/Toast";

// ─── Örnek Veriler ────────────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    id: 1,
    date: "2025-02-10T09:15:00",
    rating: 5,
    review: "Derslerin anlatımı gerçekten çok akıcı ve anlaşılır. Özellikle React hooks konusunu hiç bu kadar net kavrayamamıştım. Teşekkürler!",
    reply: "Teşekkür ederim, bu tür geri bildirimler beni çok motive ediyor. Başarılar!",
    profile: { full_name: "Ahmet Yılmaz", image: "https://i.pravatar.cc/150?img=11" },
    course: { title: "React ile Modern Web Geliştirme" },
  },
  {
    id: 2,
    date: "2025-02-14T14:30:00",
    rating: 4,
    review: "Kurs içeriği oldukça kapsamlı. Backend entegrasyonu kısmı biraz hızlı geçilmiş gibi hissettim ama genel olarak çok faydalı bir eğitimdi.",
    reply: "",
    profile: { full_name: "Zeynep Arslan", image: "https://i.pravatar.cc/150?img=5" },
    course: { title: "Django REST Framework ile API Geliştirme" },
  },
  {
    id: 3,
    date: "2025-02-17T11:00:00",
    rating: 5,
    review: "Proje tabanlı öğrenme yaklaşımı çok iyi. Teoriden ziyade pratiğe odaklanılması sayesinde öğrendiklerimi hemen uygulayabildim. Kesinlikle tavsiye ederim.",
    reply: "Harika, projeyi başarıyla tamamladığını gördüm. Devam etmeni dilerim!",
    profile: { full_name: "Burak Demir", image: "https://i.pravatar.cc/150?img=15" },
    course: { title: "Full Stack Geliştirici Bootcamp" },
  },
  {
    id: 4,
    date: "2025-02-20T16:45:00",
    rating: 3,
    review: "Kurs materyalleri güncel ama bazı videoların ses kalitesi düşük. İçerik olarak değerliydi, teknik iyileştirme yapılırsa çok daha iyi olur.",
    reply: "",
    profile: { full_name: "Selin Kaya", image: "https://i.pravatar.cc/150?img=9" },
    course: { title: "React ile Modern Web Geliştirme" },
  },
  {
    id: 5,
    date: "2025-02-23T10:20:00",
    rating: 5,
    review: "JWT ve authentication konuları mükemmel anlatılmış. Daha önce kafamda çok karışık olan token yapısını artık net anlıyorum. Eğitmen gerçekten konusuna hakim.",
    reply: "",
    profile: { full_name: "Emre Şahin", image: "https://i.pravatar.cc/150?img=22" },
    course: { title: "Django REST Framework ile API Geliştirme" },
  },
  {
    id: 6,
    date: "2025-02-25T13:55:00",
    rating: 4,
    review: "Clean Code prensiplerini gerçek kod üzerinde görmek çok aydınlatıcıydı. Ödevlerin zorluğu da tam yerinde, ne fazla ne az.",
    reply: "Değerli geri bildirim için teşekkürler. Ödev zorluk dengesi konusunda hassas olmaya çalışıyorum.",
    profile: { full_name: "Merve Öztürk", image: "https://i.pravatar.cc/150?img=3" },
    course: { title: "Full Stack Geliştirici Bootcamp" },
  },
];

// ─── Bileşen ──────────────────────────────────────────────────────────────────

function Review() {
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState("");
  const [replyMap, setReplyMap] = useState({});
  const [filteredReviews, setFilteredReview] = useState([]);

  const fetchReviewsData = () => {
    useAxios()
      .get(`teacher/review-lists/${teacherId}/`)
      .then((res) => {
        const data = res.data?.length > 0 ? res.data : MOCK_REVIEWS;
        setReviews(data);
        setFilteredReview(data);
      })
      .catch(() => {
        setReviews(MOCK_REVIEWS);
        setFilteredReview(MOCK_REVIEWS);
      });
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleSubmitReply = async (reviewId) => {
    const replyText = replyMap[reviewId] ?? "";
    try {
      await useAxios()
        .patch(`teacher/review-detail/${teacherId}/${reviewId}/`, { reply: replyText })
        .then((res) => {
          fetchReviewsData();
          Toast().fire({ icon: "success", title: "Yanıt gönderildi." });
          setReplyMap((prev) => ({ ...prev, [reviewId]: "" }));
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSortByDate = (e) => {
    const sortValue = e.target.value;
    let sortedReview = [...filteredReviews];
    if (sortValue === "Newest") {
      sortedReview.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortValue === "Oldest") {
      sortedReview.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    setFilteredReview(sortedReview);
  };

  const handleSortByRatingChange = (e) => {
    const rating = parseInt(e.target.value);
    if (rating === 0) {
      setFilteredReview(reviews);
    } else {
      setFilteredReview(reviews.filter((r) => r.rating === rating));
    }
  };

  const handleFilterByCourse = (e) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
      setFilteredReview(reviews);
    } else {
      setFilteredReview(
        reviews.filter((r) => r.course?.title?.toLowerCase().includes(query))
      );
    }
  };

  const starColor = (rating) => {
    if (rating >= 5) return "text-warning";
    if (rating >= 3) return "text-warning";
    return "text-secondary";
  };

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
              <div className="card mb-4">
                <div className="card-header d-lg-flex align-items-center justify-content-between">
                  <div className="mb-3 mb-lg-0">
                    <h3 className="mb-0">
                      <i className="fas fa-star text-warning"></i> Yorumlar</h3>
                    <span className="text-muted">
                      Kurslarınıza gelen öğrenci yorumlarını buradan yönetebilirsiniz.
                    </span>
                  </div>
                  <span className="badge bg-primary fs-6 px-3 py-2">
                    {filteredReviews.length} Yorum
                  </span>
                </div>

                <div className="card-body">
                  {/* Filtreler */}
                  <form className="row mb-4 gx-2">
                    <div className="col-xl-7 col-lg-6 col-md-4 col-12 mb-2 mb-lg-0">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Kurslarda ara..."
                        onChange={handleFilterByCourse}
                      />
                    </div>
                    <div className="col-xl-2 col-lg-2 col-md-4 col-12 mb-2 mb-lg-0">
                      <select className="form-select" onChange={handleSortByRatingChange}>
                        <option value={0}>Tüm Puanlar</option>
                        <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4)</option>
                        <option value={3}>⭐⭐⭐ (3)</option>
                        <option value={2}>⭐⭐ (2)</option>
                        <option value={1}>⭐ (1)</option>
                      </select>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-4 col-12 mb-2 mb-lg-0">
                      <select className="form-select" onChange={handleSortByDate}>
                        <option value="">Sırala</option>
                        <option value="Newest">En Yeni</option>
                        <option value="Oldest">En Eski</option>
                      </select>
                    </div>
                  </form>

                  {/* Yorum Listesi */}
                  <ul className="list-group list-group-flush">
                    {filteredReviews.map((r) => (
                      <li key={r.id} className="list-group-item p-4 shadow-sm rounded-3 mb-4 border">
                        <div className="d-flex">
                          <img
                            src={r.profile.image}
                            alt="avatar"
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                          <div className="ms-3 flex-grow-1">
                            {/* Üst satır: isim + tarih */}
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                              <div>
                                <h5 className="mb-0">{r.profile.full_name}</h5>
                                <small className="text-muted">
                                  {moment(r.date).format("DD MMM YYYY")}
                                </small>
                              </div>
                              {/* Yıldızlar */}
                              <div className={starColor(r.rating)}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star${i < r.rating ? "" : "-o"} me-1`}
                                    style={{ fontSize: 14 }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Kurs adı */}
                            <span className="badge bg-light text-dark border mb-2">
                              <i className="fas fa-graduation-cap me-1 text-primary" />
                              {r.course?.title}
                            </span>

                            {/* Yorum */}
                            <div className="bg-light rounded p-3 mb-2">
                              <p className="mb-0">
                                <span className="fw-semibold me-2">
                                  <i className="fas fa-comment text-primary me-1" />
                                  Yorum:
                                </span>
                                {r.review}
                              </p>
                            </div>

                            {/* Mevcut yanıt */}
                            {r.reply ? (
                              <div className="bg-success bg-opacity-10 border border-success rounded p-3 mb-2">
                                <p className="mb-0">
                                  <span className="fw-semibold me-2 text-success">
                                    <i className="fas fa-reply me-1" />
                                    Yanıtınız:
                                  </span>
                                  {r.reply}
                                </p>
                              </div>
                            ) : (
                              <p className="text-muted small mb-2">
                                <i className="fas fa-clock me-1" />
                                Henüz yanıt verilmedi
                              </p>
                            )}

                            {/* Yanıt butonu & formu */}
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse${r.id}`}
                              aria-expanded="false"
                            >
                              <i className="fas fa-reply me-1" />
                              {r.reply ? "Yanıtı Düzenle" : "Yanıt Yaz"}
                            </button>

                            <div className="collapse mt-3" id={`collapse${r.id}`}>
                              <div className="card card-body border-0 bg-light">
                                <label className="form-label fw-semibold">Yanıtınız</label>
                                <textarea
                                  className="form-control mb-2"
                                  rows={3}
                                  placeholder="Öğrenciye yanıtınızı yazın..."
                                  value={replyMap[r.id] ?? ""}
                                  onChange={(e) =>
                                    setReplyMap((prev) => ({ ...prev, [r.id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm align-self-start"
                                  onClick={() => handleSubmitReply(r.id)}
                                >
                                  Gönder <i className="fas fa-paper-plane ms-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}

                    {filteredReviews.length === 0 && (
                      <div className="text-center text-muted py-5">
                        <i className="fas fa-inbox fa-2x mb-2 d-block" />
                        Kayıt bulunamadı.
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ESKEPBaseFooter />
    </>
  );
}

export default Review;