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
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaListAlt,
  FaCalendarAlt,
  FaUserTie,
  FaUsers,
  FaUserCheck,
  FaUserFriends,
  FaUserTimes,
} from "react-icons/fa";
import useAxios from "@/utils/useAxios";
import HBSBaseHeader from "../partials/HBSBaseHeader";
import HBSBaseFooter from "../partials/HBSBaseFooter";

function HBSTemsilciDashboard() {
  const api = useAxios();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const res = await api.get("/agent/dashboard/summary/");
      setStats(res.data?.stats);
      setRecentAssignments(res.data?.stats.hafizlar);
      console.log(res.data?.stats);
      setAlerts(res.data?.alerts);
      setGraphData(res.data?.assignments_chart);
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <HBSBaseHeader />
      <Container className="py-4">
        {/* Sayısal Kartlar */}
        <Row className="mb-4">
          {/* Toplam Hafız */}
          <Col md={3}>
            <div className="bg-primary bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
              <FaUsers size={32} className="text-primary me-3" />
              <div>
                <h5 className="fw-bold mb-0">{stats?.total_hafiz}</h5>
                <p className="mb-0">Toplam Hafız</p>
              </div>
            </div>
          </Col>

          {/* Onaylanmış Hafız */}
          <Col md={3}>
            <div className="bg-success bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
              <FaUserCheck size={32} className="text-success me-3" />
              <div>
                <h5 className="fw-bold mb-0">{stats?.confirmed_hafiz}</h5>
                <p className="mb-0">Onaylanmış Hafız</p>
              </div>
            </div>
          </Col>

          {/* Kendisine Atanmış Hafız */}
          <Col md={3}>
            <div className="bg-warning bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
              <FaUserFriends size={32} className="text-warning me-3" />
              <div>
                <h5 className="fw-bold mb-0">{stats?.assigned_hafiz}</h5>
                <p className="mb-0">Kendisine Atanmış Hafız</p>
              </div>
            </div>
          </Col>

          {/* Onaylanmamış Hafız */}
          <Col md={3}>
            <div className="bg-danger bg-opacity-10 p-4 rounded-3 d-flex align-items-center">
              <FaUserTimes size={32} className="text-danger me-3" />
              <div>
                <h5 className="fw-bold mb-0">{stats?.unconfirmed_hafiz}</h5>
                <p className="mb-0">Onaylanmamış Hafız</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Grafik
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-3">Eğitmen Başına Hafız Sayısı</Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graphData}>
                <XAxis dataKey="egitmen" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="hafiz_sayisi" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card> */}
        {/* Hızlı Aksiyonlar */}
        <Row className="mt-4">
          <Col md={3} className="mb-2">
            <Button
              variant="primary"
              className="w-100"
              onClick={() => navigate("/hafizbilgi/create-hafizbilgi/")}
            >
              <FaUserPlus className="me-2" />
              Yeni Hafız Ekle
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="secondary"
              className="w-100"
              onClick={() => navigate("/hafizbilgi/")}
            >
              <FaListAlt className="me-2" />
              Hafızları Listele
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="warning"
              className="w-100"
              onClick={() => navigate("/dersatama/")}
            >
              <FaUserTie className="me-2" />
              Atama Yap
            </Button>
          </Col>
          <Col md={3} className="mb-2">
            <Button
              variant="info"
              className="w-100"
              onClick={() => navigate("/takvim/")}
            >
              <FaCalendarAlt className="me-2" />
              Ders Takvimi
            </Button>
          </Col>
        </Row>
        {/* Son Atamalar */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title className="mb-3">Size Atanan Son Hafızlar</Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Hafız</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recentAssignments) &&
                recentAssignments.length > 0 ? (
                  recentAssignments.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.full_name}</td>
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

        {/* Uyarılar */}
        {alerts.length > 0 && (
          <Alert variant="danger">
            <Alert.Heading>⚠️ Uyarılar</Alert.Heading>
            <ul className="mb-0">
              {alerts.map((alert, idx) => (
                <li key={idx}>{alert.message}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Container>
      <HBSBaseFooter />
    </>
  );
}

export default HBSTemsilciDashboard;
