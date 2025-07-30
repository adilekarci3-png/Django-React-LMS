import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function PrintExample() {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => {
      console.log("✅ printRef.current:", printRef.current);
      return printRef.current;
    },
    documentTitle: "YazdirilacakBelge",
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Yazdırma Testi</h2>
      <button onClick={handlePrint} style={{ padding: "10px 20px", marginBottom: "20px" }}>
        Yazdır
      </button>

      <div
        ref={printRef}
        style={{
          border: "2px solid black",
          padding: "20px",
          maxWidth: "600px",
          backgroundColor: "#f2f2f2"
        }}
      >
        <h3>Yazdırılacak Alan</h3>
        <p>Bu bölüm yazdırılacaktır.</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default PrintExample;
