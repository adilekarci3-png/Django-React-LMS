import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import useAxios from "../../utils/useAxios";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import Swal from "sweetalert2";

export default function TemsilciAtamaGrafik() {
  const [veri, setVeri] = useState([]);
  const api = useAxios();

  useEffect(() => {
    api.get("/istatistik/temsilci-top5/")
      .then((res) => setVeri(res.data))
      .catch((err) => {
        console.error("Grafik verisi alınamadı", err);
      });
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">
        🏆 En Çok Hafız Atanmış 5 Temsilci
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={veri}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis dataKey="ad" type="category" />
          <Tooltip />
          <Bar dataKey="adet" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
