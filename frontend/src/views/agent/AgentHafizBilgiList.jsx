import { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import Swal from "sweetalert2";
import HafizBilgiEditModal from "../hafizbilgi/HafizBilgiEditModal";
import HafizBilgiDetailModal from "../hafizbilgi/HafizBilgiDetailModal";

function AgentHafizBilgiList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const api = useAxios();

  useEffect(() => {
    const fetchRoleAndData = async () => {
      try {
        const roleRes = await api.get(`user-role-detail/`);
        setRoleData(roleRes.data);

        // Rol HBSEgitmen ise hafız listesi getir
        if (roleRes.data.base_role === "HBSEgitmen") {
          const agentId = user?.user_id;
          if (agentId) {
            const hafizRes = await api.get(
              `/hafizbilgi/list/?agent=${agentId}`
            );
            setHafizList(hafizRes.data); // Kullan
          }
        }
      } catch (err) {
        console.error("Veri alınamadı:", err);
      }
    };

    if (isLoggedIn()) fetchRoleAndData();
  }, [isLoggedIn, user]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kayıt silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`hafiz/hafizbilgileri/${id}/`);
        Swal.fire("Silindi!", "Kayıt başarıyla silindi.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Hata!", "Silme işlemi başarısız.", "error");
      }
    }
  };

  const openEditModal = (item = null) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const openDetailModal = (item) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  return (
    <>
      <HBSBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="card shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                <i className="bi bi-person-lines-fill"></i> Hafız Bilgileri
              </h4>
              <button
                className="btn btn-success"
                onClick={() => openEditModal(null)}
              >
                <i className="fas fa-plus"></i> Yeni Ekle
              </button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Telefon</th>
                      <th>Adres</th>
                      <th>Yıl</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td>{item.full_name}</td>
                        <td>{item.ceptel}</td>
                        <td>{item.adres}</td>
                        <td>{item.hafizlikbitirmeyili}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => openEditModal(item)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => openDetailModal(item)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          Kayıt bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <HBSBaseFooter />

      {showEditModal && (
        <HafizBilgiEditModal
          item={currentItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showDetailModal && (
        <HafizBilgiDetailModal
          item={currentItem}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
}

export default AgentHafizBilgiList;
