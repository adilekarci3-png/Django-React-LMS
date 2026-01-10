// src/api/orgChartApi.js
const BASE_URL = "http://localhost:8000/api/v1";

export async function fetchOrgChartByName(name) {
  const res = await fetch(`${BASE_URL}/orgchart/${name}/`);
  if (!res.ok) {
    throw new Error("Teşkilat şeması alınamadı");
  }
  return await res.json();
}
