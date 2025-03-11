import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../plugin/Context";
import UserData from "../plugin/UserData";

import { useAuthStore } from "../../store/auth";

import useAxios from "../../utils/useAxios";
// import './css/header.css';

function BaseHeader() {
    const [cartCount, setCartCount] = useContext(CartContext);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = () => {
        navigate(`/search/?search=${searchQuery}`);
    };

    const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);
    const [isAgent, setIsAgent] = useState(false);
    const [isTeacher, setIsTeacher] = useState(true);
    const [isStudent, setIsStudent] = useState(true);
    
    const IsUserAgent = () => {        
        try {
            useAxios()
                .get(`agent/${UserData()?.user_id}/`)
                .then((res) => {                    
                    setIsAgent(res.data);
                    // setIsAgent(false);
                    console.log(res.data);
                });
        } catch (error) {
            console.log(error);
        }
    };
    
    useEffect(() => {
        IsUserAgent();        
    },[])

    return (
        <div>
            <nav className="navbar navbar-expand-lg" style={{ background: 'linear-gradient(to right, #023e8a, #03045e, #0077b6)' }}>
                <div className="container">
                    <Link className="navbar-brand" to="/" style={{ color: '#ffffff' }}>
                        EHAD
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" to="/pages/contact-us/" style={{ color: '#ffffff' }}>
                                    {" "}
                                    <i className="fas fa-phone"></i> İletişim
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/pages/about-us/" style={{ color: '#ffffff' }}>
                                    <i className="fas fa-address-card"></i> Hakkımızda
                                </Link>
                            </li>                            
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/OrganizationChart/" style={{ color: '#ffffff' }}>
                                    <i className="fas fa-address-card"></i> Organizasyon Şemaları
                                </Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ color: '#ffffff' }}
                                >
                                    <i className="fas fa-chalkboard-user"></i> Eğitmen
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/dashboard/`}
                                            style={{ color: '#000000' }}
                                        >
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/courses/`} style={{ color: '#000000' }}>
                                            <i className="fas fa-chalkboard-user"></i> Kurslarım
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/create-course/`}
                                            style={{ color: '#000000' }}
                                        >
                                            <i className="fas fa-plus"></i> Kurs Oluştur
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/reviews/`} style={{ color: '#000000' }}>
                                            <i className="fas fa-star"></i> Yorumlar{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/question-answer/`}
                                            style={{ color: '#000000' }}
                                        >
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/students/`}
                                            style={{ color: '#000000' }}
                                        >
                                            <i className="fas fa-users"></i> Öğrenciler{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/earning/`} style={{ color: '#000000' }}>
                                            <i className="fas fa-turkish-lira"></i> Bağış{" "}
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/profile/`} style={{ color: '#000000' }}>
                                            <i className="fas fa-gear"></i> Ayarlar & Profil{" "}
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ color: '#ffffff' }}
                                >
                                    <i className="fas fa-graduation-cap"></i> Öğrenci
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link className="dropdown-item" to={`/student/dashboard/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/courses/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-chalkboard-user"></i>Kurslarım
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/student/wishlist/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-heart"></i> İstek Listesi{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/student/question-answer/`}
                                            style={{ color: '#000000' }}
                                        >
                                            {" "}
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/profile/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-gear"></i> Profil & Ayarlar
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            {isAgent && (
                                <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ color: '#ffffff' }}
                                >
                                    <i className="fas fa-user-plus"></i> Temsilci
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link className="dropdown-item" to={`/student/dashboard/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/agent/hafizbilgi/list/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-chalkboard-user"></i>Hafız Bilgileri
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/student/wishlist/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-heart"></i> İstek Listesi{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/student/question-answer/`}
                                            style={{ color: '#000000' }}
                                        >
                                            {" "}
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/profile/`} style={{ color: '#000000' }}>
                                            {" "}
                                            <i className="fas fa-gear"></i> Profil & Ayarlar
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            )}
                        </ul>
                        <div className="d-flex" role="search">
                            <input
                                className="form-control me-2 w-100"
                                type="search"
                                placeholder="Ara"
                                aria-label="Ara"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={handleSearchSubmit}
                                className="btn btn-outline-success w-50"
                                type="submit"
                            >
                                Ara <i className="fas fa-search"></i>
                            </button>
                        </div>
                        {isLoggedIn() === true ? (
                            <>
                                <Link to="/logout/" className="btn btn-primary ms-2" type="submit">
                                    Çıkış Yap <i className="fas fa-usign-out-alt"></i>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Login and register button */}
                                <Link to="/login/" className="btn btn-primary ms-2" type="submit">
                                    Giriş Yap <i className="fas fa-sign-in-alt"></i>
                                </Link>
                                <Link
                                    to="/register/"
                                    className="btn btn-primary ms-2"
                                    type="submit"
                                >
                                    Kayıt Ol <i className="fas fa-user-plus"> </i>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default BaseHeader;
