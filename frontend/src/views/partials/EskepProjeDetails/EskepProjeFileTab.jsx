import React from "react";

function EskepProjeFileTab({ curriculum }) {
  if (!curriculum || curriculum.length === 0) {
    return <p>Bu projeye ait PDF bulunamadı.</p>;
  }

  return (
    <div className="row">
      {curriculum.map((variant) => (
        <div key={variant.id} className="mb-4">
          <h5 className="mb-3">{variant.title || "Bölüm"}</h5>
          {variant.variant_items?.map((item) => (
            <div key={item.id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <p className="fw-bold mb-2">{item.title}</p>
                {item.file ? (
                  <a
                    href={item.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    PDF Dosyasını Görüntüle
                  </a>
                ) : (
                  <p className="text-muted">PDF dosyası yok</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default EskepProjeFileTab;
