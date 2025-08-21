import React, { useState, useEffect } from "react";
import {
    FaUser,
    FaPlus,
    FaVideo,
    FaClock,
    FaRegFileVideo,
    FaListUl,
    FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Modal, Box } from "@mui/material";
import EducatorEditForm from "./EducatorEditForm";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";

function EducatorList() {
    const [educators, setEducators] = useState([]);
    const [isFetched, setIsFetched] = useState(false);
    const api = useAxios();
    const userData = useUserData();
    const [openModal, setOpenModal] = useState(false);
    const [selectedEducator, setSelectedEducator] = useState(null);

    useEffect(() => {
        if (!isFetched && userData?.base_roles?.includes("Koordinator")) {
            const fetchEducators = async () => {
                try {
                    const response = await api.get("/educator/list/");
                    setEducators(response.data);
                    setIsFetched(true);
                } catch (error) {
                    console.error("Eğitmen verileri alınırken hata oluştu:", error);
                }
            };
            fetchEducators();
        }
    }, [api, userData, isFetched]);

    const handleOpenModal = (educator) => {
        setSelectedEducator(educator);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedEducator(null);
    };

    const handleEducatorUpdated = (updatedEducator) => {
        setEducators((prev) =>
            prev.map((edu) => (edu.id === updatedEducator.id ? updatedEducator : edu))
        );
        handleCloseModal();
    };
    return (
        <>
            <ESKEPBaseHeader />
            <section className="pt-5 pb-5">
                <div className="container">
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        <div className="col-lg-3 col-md-4 col-12">
                            <Sidebar />
                        </div>
                        <div className="col-lg-9 col-md-8 col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Eğitmen Listesi</h5>
                                    <Link to="/eskepegitmen/ders-olustur/" className="btn btn-light btn-sm">
                                        <FaPlus className="me-2" />
                                        Yeni Ders
                                    </Link>
                                </div>
                                <div className="card-body">
                                    {educators.length === 0 ? (
                                        <p>Henüz eğitmen bulunmamaktadır.</p>
                                    ) : (
                                        <ul className="list-group">
                                            {educators.map((educator) => (
                                                <li
                                                    key={educator.id}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={educator.image}
                                                            alt={educator.full_name}
                                                            className="rounded-circle"
                                                            style={{
                                                                width: "50px",
                                                                height: "50px",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <span className="ms-3 fw-bold">{educator.full_name}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <FaUser
                                                            className="text-primary mx-2 fs-5"
                                                            title="Eğitmeni Düzenle"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleOpenModal(educator)}
                                                        />
                                                        <Link to={`/eskepegitmen/video-ekle/${educator.id}`}>
                                                            <FaVideo className="text-warning mx-2 fs-5" title="Video Ekle" />
                                                        </Link>

                                                        <Link to={`/eskepegitmen/ders-saat-ekle/${educator.id}`}>
                                                            <FaClock className="text-info mx-2 fs-5" title="Ders Saati Ekle" />
                                                        </Link>

                                                        <Link to={`/eskepegitmen/video-olustur/${educator.id}`}>
                                                            <FaRegFileVideo className="text-danger mx-2 fs-5" title="Video Oluştur" />
                                                        </Link>

                                                        <Link to={`/eskepegitmen/video-list/${educator.id}`}>
                                                            <FaListUl className="text-secondary mx-2 fs-5" title="Video Listesi" />
                                                        </Link>

                                                        <Link to={`/eskepegitmen/youtube-canli/${educator.id}`}>
                                                            <FaYoutube className="text-danger mx-2 fs-5" title="YouTube Canlı Yayın" />
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Düzenleme Modali */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: 800,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}
                >
                    {selectedEducator && (
                        <EducatorEditForm
                            educator={selectedEducator}
                            onClose={handleCloseModal}
                            onUpdate={handleEducatorUpdated}
                        />
                    )}
                </Box>
            </Modal>

            <ESKEPBaseFooter />
        </>
    );
}

export default EducatorList;
