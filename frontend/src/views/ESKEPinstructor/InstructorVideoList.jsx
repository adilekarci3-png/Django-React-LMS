import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";  // Sidebar import edildi

function InstructorVideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/instructor/videos/");
      setVideos(response.data);
    } catch (error) {
      console.error("Video listesi alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu video silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "İptal",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/instructor/videos/${id}/delete/`);
        setVideos(videos.filter((video) => video.id !== id));
        Swal.fire("Silindi!", "Video başarıyla silindi.", "success");
      } catch (error) {
        Swal.fire("Hata", "Silme işlemi başarısız oldu.", "error");
      }
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <>
      <ESKEPBaseHeader />
      <section className="container py-4">
        <div className="row mt-0 mt-md-4">
          {/* Sidebar Here */}
          <Sidebar />
          <div className="col-lg-9 col-md-8 col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Eğitmen Videoları</h4>
              <Link to="/egitmen/video-ekle" className="btn btn-success">
                + Video Ekle
              </Link>
            </div>

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : videos.length === 0 ? (
              <p>Henüz video eklenmemiş.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Açıklama</th>
                    <th>Video Bağlantısı</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td>{video.title}</td>
                      <td>{video.description}</td>
                      <td>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          İzle
                        </a>
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
                        >
                          Sil
                        </Button>
                        {/* Güncelleme butonu istenirse buraya eklenebilir */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default InstructorVideoList;
