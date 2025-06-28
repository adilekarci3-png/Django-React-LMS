import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
import Peer from "peerjs";
import UserData from "../plugin/UserData";
import useAxios from "../../utils/useAxios";
import HDMBaseHeader from "../partials/HDMBaseHeader";

Modal.setAppElement("#root");

export default function KuranDinleme() {
  const canvasRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const api = useAxios();

  const [tool, setTool] = useState("pen");
  const [shapeType] = useState("circle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [pendingShape, setPendingShape] = useState(null);
  const [page, setPage] = useState(1);
  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [peerInstance, setPeerInstance] = useState(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1000;

  useEffect(() => {
    const peer = new Peer();
    setPeerInstance(peer);

    peer.on("open", async (id) => {
      setPeerId(id);
      await api.post("peer-id/", { peer_id: id });
    });

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        call.answer(stream);
        localVideoRef.current.srcObject = stream;
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });
  }, []);

  useEffect(() => {
    api.get(`peer-id/?user_id=${UserData()?.user_id}`).then((res) => {
      setRemoteId(res.data.peer_id);
    });
  }, []);

  const callRemote = () => {
    if (!remoteId || !peerInstance) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      const call = peerInstance.call(remoteId, stream);
      localVideoRef.current.srcObject = stream;
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  const startDrawing = (e) => {
    if (tool !== "pen") return;
    const { offsetX, offsetY } = e.nativeEvent;
    setStartPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || tool !== "pen") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = e.nativeEvent;
    drawBackground(ctx);
    redrawAnnotations(ctx);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const centerX = startPos.x;
    const centerY = offsetY;
    const radiusX = Math.abs(offsetX - startPos.x);
    const radiusY = Math.abs(offsetY - startPos.y);
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing || tool !== "pen") return;
    const { offsetX, offsetY } = e.nativeEvent;
    const newShape = {
      shape_type: shapeType,
      coordinates: {
        x1: startPos.x,
        y1: startPos.y,
        x2: offsetX,
        y2: offsetY,
      },
    };
    setPendingShape(newShape);
    setModalOpen(true);
    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (pendingShape && errorType) {
      const updated = { ...pendingShape, hata_turu: errorType };

      try {
        if (pendingShape.id) {
          await api.put(`hatalar/${pendingShape.id}/`, {
            shape_type: updated.shape_type,
            coordinates: updated.coordinates,
            hata_turu: updated.hata_turu,
          });
          setAnnotations((prev) =>
            [...prev.filter((a) => a.id !== updated.id), updated].sort((a, b) =>
              a.hata_turu.localeCompare(b.hata_turu)
            )
          );
        } else {
          const res = await api.post("hatalar/", {
            hafiz: 1,
            sayfa: page,
            shape_type: updated.shape_type,
            coordinates: updated.coordinates,
            hata_turu: updated.hata_turu,
            created_by: UserData()?.user_id,
          });
          updated.id = res.data.id;
          setAnnotations((prev) =>
            [...prev, updated].sort((a, b) => a.hata_turu.localeCompare(b.hata_turu))
          );
        }
      } catch (err) {
        console.error("Kaydetme hatası:", err);
      }

      setModalOpen(false);
      setErrorType("");
      setPendingShape(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bu hatayı silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    try {
      await api.delete(`hatalar/${id}/`);
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Silme işlemi başarısız:", err);
    }
  };

  const handleEraserClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const filtered = annotations.filter((ann) => {
      const { x1, y1, x2, y2 } = ann.coordinates;
      return distanceFromPointToLine(x, y, x1, y1, x2, y2) > 20;
    });
    setAnnotations(filtered);
  };

  const distanceFromPointToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;
    const xx = (param < 0) ? x1 : (param > 1 ? x2 : x1 + param * C);
    const yy = (param < 0) ? y1 : (param > 1 ? y2 : y1 + param * D);
    return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
  };

  const redrawAnnotations = (ctx) => {
    annotations.forEach(({ coordinates: { x1, y1, x2, y2 }, hata_turu }) => {
      ctx.strokeStyle = hata_turu === "okuma" ? "orange" : "skyblue";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x1, y2, Math.abs(x2 - x1), Math.abs(y2 - y1), 0, 0, 2 * Math.PI);
      ctx.stroke();
    });
  };

  const drawBackground = (ctx) => {
    const img = new Image();
    img.src = `/images/quran-page-${page}.jpg`;
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      redrawAnnotations(ctx);
    };
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    drawBackground(ctx);
  }, [annotations, page]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const res = await api.get(`hatalar/?sayfa=${page}`);
        setAnnotations(
          res.data
            .map(item => ({
              id: item.id,
              shape_type: item.shape_type,
              coordinates: item.coordinates,
              hata_turu: item.hata_turu,
            }))
            .sort((a, b) => a.hata_turu.localeCompare(b.hata_turu))
        );
      } catch (error) {
        console.error("Hata notları getirilemedi:", error);
      }
    };
    fetchAnnotations();
  }, [page]);

  return (
    <>
      <HDMBaseHeader />
      <div className="container py-4 text-center">
        <p><strong>Peer ID:</strong> {peerId}</p>
        <button className="btn btn-outline-primary mb-3" onClick={callRemote}>
          📹 Görüntülü Görüşmeye Başla
        </button>

        <div className="d-flex justify-content-center gap-4 mb-3">
          <video ref={localVideoRef} autoPlay playsInline muted width="320" height="240" className="border" />
          <video ref={remoteVideoRef} autoPlay playsInline width="320" height="240" className="border" />
        </div>

        <div className="d-flex justify-content-center align-items-start gap-4">
          {/* Kalem ve Silgi */}
          <div className="d-flex flex-column align-items-center gap-3 pt-2">
            <button
              className={`btn ${tool === "pen" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTool("pen")}
              title="Kalem"
            >
              ✏️ Kalem
            </button>
            <button
              className={`btn ${tool === "eraser" ? "btn-danger" : "btn-outline-secondary"}`}
              onClick={() => setTool("eraser")}
              title="Silgi"
            >
              🧽 Silgi
            </button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-dark shadow"
            style={{ cursor: tool === "pen" ? "crosshair" : "pointer" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onClick={(e) => tool === "eraser" && handleEraserClick(e)}
          />

          {/* Hata Listesi */}
          <div style={{ width: "320px" }} className="border rounded p-3 bg-light shadow-sm">
            <h5 className="mb-3">Hata Listesi</h5>
            {annotations.length === 0 ? (
              <p className="text-muted">Henüz hata eklenmedi.</p>
            ) : (
              <ul className="list-group" style={{ maxHeight: "900px", overflowY: "auto" }}>
                {annotations.map((ann, idx) => (
                  <li
                    key={idx}
                    className="list-group-item py-2 d-flex justify-content-between align-items-start flex-column"
                  >
                    <div>
                      <strong>Tür: </strong>
                      <span className={`badge ${ann.hata_turu === "okuma" ? "bg-warning text-dark" : "bg-info text-dark"}`}>
                        {ann.hata_turu}
                      </span><br />
                      <small>
                        ({ann.coordinates.x1}, {ann.coordinates.y1}) - ({ann.coordinates.x2}, {ann.coordinates.y2})
                      </small>
                    </div>
                    <div className="mt-2 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setPendingShape(ann);
                          setErrorType(ann.hata_turu);
                          setModalOpen(true);
                        }}
                      >
                        📝 Düzenle
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(ann.id)}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          style={{ content: { width: "400px", margin: "auto", padding: "20px" } }}
        >
          <h5>Hata Türü Seç</h5>
          <select
            className="form-select mb-3"
            value={errorType}
            onChange={(e) => setErrorType(e.target.value)}
          >
            <option value="">Hata Türü Seçin</option>
            <option value="okuma">Okuma Hatası</option>
            <option value="hareket">Hareket Hatası</option>
          </select>
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary me-2" onClick={() => setModalOpen(false)}>İptal</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!errorType}
            >
              Kaydet
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
