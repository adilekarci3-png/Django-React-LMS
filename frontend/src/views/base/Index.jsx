import React, { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import apiInstance from "../../utils/axios";
import "./css/Index.css";

function Index() {
  const [projelist, setProjeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useContext(CartContext);

  const country = GetCurrentAddress().country;
  const userId = UserData()?.user_id;

  useEffect(() => {
    const fetchProjelist = async () => {
      setIsLoading(true);
      try {
        const res = await apiInstance.get("proje/list/");
        setProjeList(res.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Toast().fire({
          title: "Projeler yüklenemedi",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjelist();
  }, []);

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return projelist.slice(indexOfFirstItem, indexOfLastItem);
  }, [projelist, currentPage]);

  // Modül açıklamaları
  const getModuleDescription = (name) => {
    switch (name) {
      case "Hafızlık Bilgi Sistemi":
        return "Hafız kayıtlarını ve gelişim takibini yönetin";
      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return "Staj ve proje süreçlerini yönetin";
      case "EHAD Akademi":
        return "İslami ilimlerin dijital ortamda takibini sağlayın";
      case "Hafızlık Dinleme Merkezi":
        return "Sesli tekrar ve dinleme sistemini yönetin";
      default:
        return "Bu modül hakkında yakında bilgi eklenecek.";
    }
  };

  // Modül yönlendirmeleri
  const getButtonLabelAndLink = (name) => {
    switch (name) {
      case "Hafızlık Bilgi Sistemi":
        return { label: "HBS'ye Git", to: "/hafizbilgi/" };
      case "EHAD Staj ve Kariyer Eğitimi Programı":
        return { label: "ESKEP'e Git", to: "/eskep/" };
      case "EHAD Akademi":
        return { label: "AKADEMİ'ye Git", to: "/akademi/" };
      case "Hafızlık Dinleme Merkezi":
        return { label: "HDM'ye Git", to: "/hdm/" };
      default:
        return null;
    }
  };

  return (
    <>
      <AkademiBaseHeader />
      <div className="index-container">
        <div className="index-heading">
          <h2 className="main-title">İZEM – Hafızların Dijital Kapısı</h2>
          <p className="sub-title">Akıllı Altyapı, Entegre Sistem</p>
        </div>

        <div className="index-grid">
          {currentItems.map((s, index) => {
            const route = getButtonLabelAndLink(s.name);
            const description = getModuleDescription(s.name);

            return (
              <div className="index-card" key={index}>
                <div className="index-image-container">
                  <img src={s.image} alt={s.name} className="index-image" />
                </div>
                <div className="index-card-body">
                  <h3 className="index-card-title">{s.name}</h3>
                  <p className="index-desc">{description}</p>
                  {route ? (
                    <Link to={route.to}>
                      <button className="index-btn">{route.label}</button>
                    </Link>
                  ) : (
                    <button disabled className="index-btn-disabled">
                      Yakında
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AkademiBaseFooter />
    </>
  );
}

export default Index;
