import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../plugin/Context";
import UserData from "../plugin/UserData";

import { useAuthStore } from "../../store/auth";

import useAxios from "../../utils/useAxios";

function ESKEPBaseHeader() {
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
    
    const styles = {
        section: {
          fontSize: "18px",
          color: "#292b2c",
          backgroundColor: "#D8F0C6",
          padding: "5px",
          margin:"0px"
        },
        wrapper: {
          textAlign: "center",
          margin: "0 auto",
          marginTop: "50px"
        }
      }
      

    useEffect(() => {
        IsUserAgent();        
    },[])
    return (      
        <div style={styles.section}>
            <nav className="navbar navbar-expand-lg navbar-green bg-green">
                <div className="container">
                    <Link className="navbar-brand" to="/">
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
                                <Link className="nav-link" to="/pages/contact-us/">
                                    {" "}
                                    <i className="fas fa-phone"></i> İletişim
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/pages/about-us/">
                                    <i className="fas fa-address-card"></i> Hakkımızda
                                </Link>
                            </li>                            
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/OrganizationChart/">
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
                                >
                                    <i className="fas fa-chalkboard-user"></i> Koordinatör
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/dashboard/`}
                                        >
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/courses/`}>
                                            <i className="fas fa-chalkboard-user"></i> Kurslarım
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/create-course/`}
                                        >
                                            <i className="fas fa-plus"></i> Kurs Oluştur
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/reviews/`}>
                                            <i className="fas fa-star"></i> Yorumlar{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/question-answer/`}
                                        >
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/instructor/students/`}
                                        >
                                            <i className="fas fa-users"></i> Öğrenciler{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/earning/`}>
                                            <i className="fas fa-turkish-lira"></i> Bağış{" "}
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/instructor/profile/`}>
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
                                >
                                    <i className="fas fa-graduation-cap"></i> Öğrenci
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link className="dropdown-item" to={`/student/dashboard/`}>
                                            {" "}
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/courses/`}>
                                            {" "}
                                            <i className="fas fa-chalkboard-user"></i>Kurslarım
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/student/wishlist/`}>
                                            {" "}
                                            <i className="fas fa-heart"></i> İstek Listesi{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/student/question-answer/`}
                                        >
                                            {" "}
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/profile/`}>
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
                                >
                                    <i className="fas fa-user-plus"></i> Temsilci
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link className="dropdown-item" to={`/student/dashboard/`}>
                                            {" "}
                                            <i className="bi bi-grid-fill"></i> Panel
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/agent/hafizbilgi/list/`}>
                                            {" "}
                                            <i className="fas fa-chalkboard-user"></i>Hafız Bilgileri
                                        </Link>
                                    </li>

                                    <li>
                                        <Link className="dropdown-item" to={`/student/wishlist/`}>
                                            {" "}
                                            <i className="fas fa-heart"></i> İstek Listesi{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/student/question-answer/`}
                                        >
                                            {" "}
                                            <i className="fas fa-envelope"></i> Soru/Cevap{" "}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to={`/student/profile/`}>
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
                                placeholder="Kurslarda Ara"
                                aria-label="Kurslarda Ara"
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
                        {/* <Link className="btn btn-success ms-2" to="/cart/">
                            Hafızlık Bilgi Sistemi ({cartCount}) <i className="fas fa-shopping-cart"> </i>
                        </Link> */}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default ESKEPBaseHeader;
