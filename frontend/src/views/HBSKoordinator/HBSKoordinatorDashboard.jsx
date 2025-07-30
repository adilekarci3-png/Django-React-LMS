import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Alert,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useAxios from "../../utils/useAxios";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";
import Swal from "sweetalert2";
import HafizBilgiCreate from "../hafizbilgi/HafizBilgiCreate";
import HafizBilgiList from "../hafizbilgi/HafizBilgiList";

function HBSKoordinatorDashboard() {
  const api = useAxios();
  const [stats, setStats] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const res1 = await api.get("/dashboard/summary/");
      const res2 = await api.get("/dashboard/assignments_chart/");
      const res3 = await api.get("/dashboard/recent_assignments/");
      console.log(res1.data);
      console.log(res2.data);
      console.log(res3.data);
      setStats(res1.data?.stats);
      setRecentAssignments(res3.data);
      setAlerts(res1.data?.alerts);
      setGraphData(res2.data);
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <HBSBaseHeader />
      <Container className="py-4">
        {/* Sayısal Kartlar */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Toplam Hafız</Card.Title>
                <h3>{stats?.total_hafiz}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Toplam Eğitmen</Card.Title>
                <h3>{stats?.total_egitmen}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Onaylanmış Hafız</Card.Title>
                <h3>{stats?.assigned_hafiz}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Onaylanmamış Hafız</Card.Title>
                <h3>{stats?.unassigned_hafiz}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Grafik */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-3">
              Eğitmen Başına Hafız Sayısı
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graphData}>
                <XAxis dataKey="egitmen" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="hafiz_sayisi" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Son Atamalar */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-3">
              Son Hafız - Eğitmen Atamaları
            </Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Hafız</th>
                  <th>Eğitmen</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recentAssignments) &&
                recentAssignments.length > 0 ? (
                  recentAssignments.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.hafiz_name}</td>
                      <td>{item.egitmen_name}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      Kayıt bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Hızlı Aksiyonlar */}
        <Row className="mt-4">
          <Col md={3} className="mb-2">
            <Button
              variant="primary"
              className="w-100"
              onClick={() => (location.href = "/hafizbilgi/create-hafizbilgi/")}
            >
              Yeni Hafız Ekle
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="success"
              className="w-100"
              onClick={() => (location.href = "/egitmen/create/")}
            >
              Temsilci Ekle
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="warning"
              className="w-100"
              onClick={() => (location.href = "/dersatama/")}
            >
              Temsilci Hafız Atama
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="info"
              className="w-100"
              onClick={() => (location.href = "/takvim/")}
            >
              Temsilci Hafız Bilgileri
            </Button>
          </Col>
        </Row>
      </Container>
      <HBSBaseFooter />
    </>
  );
}
export default HBSKoordinatorDashboard;
