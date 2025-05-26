import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function KuranDinleme() {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [shapeType, setShapeType] = useState("line");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [pendingShape, setPendingShape] = useState(null);
  const [page, setPage] = useState(1);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1000;

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

    if (shapeType === "line") {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(offsetX, offsetY);
    } else if (shapeType === "circle") {
      const radius = Math.sqrt(
        Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
      );
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
    }
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
      text: "",
    };

    setPendingShape(newShape);
    setModalOpen(true);
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (pendingShape) {
      const updated = { ...pendingShape, text };
      const updatedList = annotations.map((ann) =>
        ann === pendingShape ? updated : ann
      );

      const exists = annotations.includes(pendingShape);
      setAnnotations(exists ? updatedList : [...annotations, updated]);
    }

    setModalOpen(false);
    setText("");
    setPendingShape(null);
  };

  const handleEraserClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const filtered = annotations.filter((ann) => {
      const { x1, y1, x2, y2 } = ann.coordinates;
      const dist = distanceFromPointToLine(x, y, x1, y1, x2, y2);
      return dist > 20;
    });

    setAnnotations(filtered);
  };

  const distanceFromPointToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const redrawAnnotations = (ctx) => {
    annotations.forEach((ann) => {
      const { x1, y1, x2, y2 } = ann.coordinates;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ann.shape_type === "line") {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      } else if (ann.shape_type === "circle") {
        const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    });
  };

  const drawBackground = (ctx) => {
    const background = new Image();
    background.src = `/images/quran-page-${page}.jpg`;
    background.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      redrawAnnotations(ctx);
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawBackground(ctx);
  }, [annotations, page]);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center align-items-start mt-4">
        <div className="col-md-2 text-center">
          <img src="/images/instructor.jpg" alt="Eğitmen" className="img-fluid border border-primary" style={{ width: 120, height: 120, objectFit: 'cover' }} />
          <p className="fw-bold text-primary mt-2">Eğitmen</p>
        </div>

        <div className="col-md-8 text-center">
          <h3 className="mb-3">📖 Hafızlık Dinleme Merkezi</h3>

          <div className="mb-3">
            <button onClick={() => setTool("pen")} className={`btn me-2 ${tool === "pen" ? "btn-primary" : "btn-outline-primary"}`}>
              ✏️ Kalem
            </button>
            <button onClick={() => setTool("eraser")} className={`btn ${tool === "eraser" ? "btn-danger" : "btn-outline-danger"}`}>
              🧽 Silgi
            </button>
            <select className="form-select d-inline w-auto ms-2" value={shapeType} onChange={(e) => setShapeType(e.target.value)}>
              <option value="line">Çizgi</option>
              <option value="circle">Daire</option>
            </select>
          </div>

          <div className="mb-3">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="btn btn-outline-secondary me-2">⬅️ Geri</button>
            <button onClick={() => setPage((prev) => prev + 1)} className="btn btn-outline-secondary">➡️ İleri</button>
          </div>

          <div style={{ width: CANVAS_WIDTH, margin: "0 auto" }} className="text-start mb-4">
            <h5>📝 Girilen Hatalar / Açıklamalar</h5>
            {annotations.length === 0 ? (
              <p>Henüz açıklama girilmedi.</p>
            ) : (
              <ul className="list-group">
                {annotations.map((ann, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>#{index + 1}</strong>: {ann.text || <em>Boş açıklama</em>}<br />
                      <small className="text-muted">
                        ({Math.round(ann.coordinates.x1)}, {Math.round(ann.coordinates.y1)})
                      </small>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                        setPendingShape(ann);
                        setText(ann.text);
                        setModalOpen(true);
                      }}>
                        Düzenle
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => {
                        setAnnotations(annotations.filter((_, i) => i !== index));
                      }}>
                        Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-dark shadow mb-4"
            style={{ cursor: tool === "pen" ? "crosshair" : "pointer" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onClick={(e) => {
              if (tool === "eraser") handleEraserClick(e);
            }}
          />
        </div>

        <div className="col-md-2 text-center">
          <img src="/images/student.jpg" alt="Hafız" className="img-fluid border border-success" style={{ width: 120, height: 120, objectFit: 'cover' }} />
          <p className="fw-bold text-success mt-2">Hafız</p>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Not Ekle"
        style={{
          content: {
            width: "400px",
            height: "250px",
            margin: "auto",
            padding: "20px",
          },
        }}
      >
        <h4>📝 Açıklama Girin</h4>
        <textarea className="form-control mb-3" rows="4" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={handleSave} className="btn btn-primary me-2">Kaydet</button>
        <button onClick={() => setModalOpen(false)} className="btn btn-secondary">İptal</button>
      </Modal>
    </div>
  );
}
