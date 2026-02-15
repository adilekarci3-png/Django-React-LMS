import { useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";

export default function AvatarCropModal({ open, onClose, file, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Fotoğrafı kırp</div>

        <div
          style={{
            position: "relative",
            height: 360,
            background: "black",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {file && (
            <>
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />

              {/* Yuvarlak sınır */}
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.85)",
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Yakınlaştır</div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <button
            onClick={onClose}
            type="button"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            İptal
          </button>

          <button
            type="button"
            onClick={() => {
              if (!croppedAreaPixels || !imageUrl) return;
              onConfirm(croppedAreaPixels, imageUrl);
            }}
            disabled={!file || !croppedAreaPixels}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              background: "#111",
              color: "white",
              opacity: !file || !croppedAreaPixels ? 0.6 : 1,
            }}
          >
            Devam
          </button>
        </div>
      </div>
    </div>
  );
}
