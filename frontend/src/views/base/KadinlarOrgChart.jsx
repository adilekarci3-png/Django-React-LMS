// src/pages/KadinlarOrgChart.jsx
import React, { useEffect, useState } from "react";
import { fetchOrgChartByName } from "../../api/orgChartApi";
import OrgNode from "./OrgNode";
import "./css/OrgChart.css";

import HomeHeader from "../partials/HomeHeader";
import HomeFooter from "../partials/HomeFooter";

// PDF’ten gelen sabit + örnek üyeler
const FALLBACK_ROOT = {
  id: 1,
  name: "Kadınlar",
  employees: [
    { id: 9001, full_name: "Ayşe Nur Kılıç", title: "Kadınlar Koord." },
  ],
  members: [],
  children: [
    {
      id: 2,
      name: "Kadınlar Komisyonu Başkanı",
      employees: [
        { id: 9002, full_name: "Fatma Erdoğan", title: "Başkan" },
      ],
      members: [
        { id: 9101, Name: "Zehra Çetin", designation_name: "Başkan Yard." },
      ],
      children: [
        {
          id: 3,
          name: "Özel Kalem Müdürü",
          employees: [
            { id: 9003, full_name: "Merve Demir", title: "Özel Kalem" },
          ],
          members: [],
          children: [],
        },
        {
          id: 4,
          name: "Danışmanlar",
          employees: [],
          members: [
            { id: 9102, Name: "Dr. Sema Yıldız", designation_name: "Danışman" },
            { id: 9103, Name: "Ülfet Kaya", designation_name: "Danışman" },
          ],
          children: [],
        },
      ],
    },
    {
      id: 5,
      name: "Başkanlık Divanı",
      employees: [
        { id: 9004, full_name: "Zeynep Hökelek", title: "Divan Üyesi" },
      ],
      members: [],
      children: [],
    },
    {
      id: 6,
      name: "İstişare Kurulu",
      employees: [],
      members: [
        { id: 9104, Name: "Prof. Dr. Hediye Ak", designation_name: "Kurul Üyesi" },
        { id: 9105, Name: "N. Şule Aydın", designation_name: "Kurul Üyesi" },
      ],
      children: [],
    },
    {
      id: 7,
      name: "Bölgeler",
      employees: [
        { id: 9005, full_name: "Rabia Şahan", title: "Bölge Sorumlusu" },
      ],
      members: [],
      children: [],
    },
    {
      id: 8,
      name: "Şubeler",
      employees: [
        { id: 9006, full_name: "M. Esra Yavuz", title: "Şube Sorumlusu" },
      ],
      members: [],
      children: [],
    },
    {
      id: 9,
      name: "İlçe Temsilcilikleri",
      employees: [
        { id: 9007, full_name: "H. Kübra Karaca", title: "İlçe Tems." },
      ],
      members: [],
      children: [],
    },

    // TEŞKİLAT
    {
      id: 10,
      name: "Teşkilat Komisyonu",
      employees: [
        { id: 9008, full_name: "Şeyma Kurt", title: "Teşkilat Bşk." },
      ],
      members: [],
      children: [
        {
          id: 11,
          name: "1. Bölge ve Şube Başkanları",
          employees: [
            { id: 9009, full_name: "G. Zeliha Kar", title: "Bölge Bşk." },
          ],
          members: [],
          children: [],
        },
        {
          id: 12,
          name: "2. İlçe Temsilcileri Birimi",
          employees: [
            { id: 9010, full_name: "Serra Yıldırım", title: "İlçe Birim Srm." },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // SEKRETERYA
    {
      id: 20,
      name: "Sekreterya Komisyonu",
      employees: [
        { id: 9011, full_name: "Büşra Bal", title: "Sekreterya Srm." },
      ],
      members: [],
      children: [
        {
          id: 21,
          name: "1. Protokol ve Temsil Birimi",
          employees: [
            { id: 9012, full_name: "Ebru Koç", title: "Protokol" },
          ],
          members: [],
          children: [],
        },
        {
          id: 22,
          name: "2. Ar-Ge Birimi",
          employees: [
            { id: 9013, full_name: "Sare Sevinç", title: "Ar-Ge" },
          ],
          members: [],
          children: [],
        },
        {
          id: 23,
          name: "3. İdare Amiri",
          employees: [
            { id: 9014, full_name: "Havva Çelik", title: "İdare Amiri" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // MALİ
    {
      id: 30,
      name: "Mali İşler Komisyonu",
      employees: [
        { id: 9015, full_name: "Meryem Uysal", title: "Mali İşler" },
      ],
      members: [],
      children: [
        {
          id: 31,
          name: "1. Eğitim Yardımı ve Burslar Birimi",
          employees: [
            { id: 9016, full_name: "H. Nazlı Işık", title: "Burslar" },
          ],
          members: [],
          children: [],
        },
        {
          id: 32,
          name: "2. Kaynak Geliştirme Birimi",
          employees: [
            { id: 9017, full_name: "Aysun Sağlam", title: "Kaynak Geliştirme" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // İK + BİLGİ İŞLEM
    {
      id: 40,
      name: "İnsan Kaynakları ve Bilgi İşlem Komisyonu",
      employees: [
        { id: 9018, full_name: "İrem Güden", title: "İK ve Bİ Srm." },
      ],
      members: [],
      children: [
        {
          id: 41,
          name: "1. İstatistik ve HBS Birimi",
          employees: [
            { id: 9019, full_name: "Neslihan Gül", title: "HBS" },
          ],
          members: [],
          children: [],
        },
        {
          id: 42,
          name: "2. İstihdam ve İntaç Birimi",
          employees: [
            { id: 9020, full_name: "Gülsüm Aydın", title: "İstihdam" },
          ],
          members: [],
          children: [],
        },
        {
          id: 43,
          name: "3. Üyeler ve Arşiv Birimi",
          employees: [
            { id: 9021, full_name: "Seda Özer", title: "Arşiv" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // EĞİTİM
    {
      id: 50,
      name: "Eğitim Komisyonu",
      employees: [
        { id: 9022, full_name: "Hatice Nur Yılmaz", title: "Eğitim Bşk." },
      ],
      members: [],
      children: [
        {
          id: 51,
          name: "1. Eğitim Portalı Akademi",
          employees: [
            { id: 9023, full_name: "İlayda Er", title: "Akademi Koord." },
          ],
          members: [],
          children: [],
        },
        {
          id: 52,
          name: "2. Hafızlık Dinleme Merkezi (HDM)",
          employees: [
            { id: 9024, full_name: "Esma Kızıl", title: "HDM Srm." },
          ],
          members: [],
          children: [],
        },
        {
          id: 53,
          name: "3. Kıraat İlimleri Birimi",
          employees: [
            { id: 9025, full_name: "Sümeyye Kara", title: "Kıraat" },
          ],
          members: [],
          children: [],
        },
        {
          id: 54,
          name: "4. Hayat Boyu Eğitim ve Rehberlik Birimi",
          employees: [
            { id: 9026, full_name: "B. Şeyda Naz", title: "Rehberlik" },
          ],
          members: [],
          children: [],
        },
        {
          id: 55,
          name: "5. Engelli Hafızlar Birimi",
          employees: [
            { id: 9027, full_name: "Z. Hilal Özkan", title: "Engelli Hafızlar" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // TANITIM
    {
      id: 60,
      name: "Tanıtım ve Medya Komisyonu",
      employees: [
        { id: 9028, full_name: "Hilal Tok", title: "Tanıtım & Medya" },
      ],
      members: [],
      children: [
        {
          id: 61,
          name: "1. Basın, Yayın ve Materyal Birimi",
          employees: [
            { id: 9029, full_name: "Mina Özel", title: "Basın" },
          ],
          members: [],
          children: [],
        },
        {
          id: 62,
          name: "2. İnternet ve Sosyal Medya Birimi",
          employees: [
            { id: 9030, full_name: "İklim Duru", title: "Sosyal Medya" },
          ],
          members: [],
          children: [],
        },
        {
          id: 63,
          name: "3. Organizasyonlar ve Vefa Programları Birimi",
          employees: [
            { id: 9031, full_name: "Z. Sude Baş", title: "Org./Vefa" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // GENÇLİK
    {
      id: 70,
      name: "Gençlik Komisyonu (Genç Eğitim Portalı)",
      employees: [
        { id: 9032, full_name: "Sena Yüce", title: "Gençlik Srm." },
      ],
      members: [],
      children: [
        {
          id: 71,
          name: "1. Kur'an Kursları Birimi",
          employees: [
            { id: 9033, full_name: "Şevval Güner", title: "Kurslar" },
          ],
          members: [],
          children: [],
        },
        {
          id: 72,
          name: "2. Hafızlık Proje İHL ve Kur’an Eğitim Merkezleri Birimi",
          employees: [
            { id: 9034, full_name: "Kübra Dede", title: "Proje İHL" },
          ],
          members: [],
          children: [],
        },
        {
          id: 73,
          name: "3. Yüksek Öğrenim Hafızlık Birimi",
          employees: [
            { id: 9035, full_name: "S. Beyza Telli", title: "YÖ Hafızlık" },
          ],
          members: [],
          children: [],
        },
        {
          id: 74,
          name: "4. ESKEP Birimi",
          employees: [
            { id: 9036, full_name: "Havvanur Kocaoğlu", title: "ESKEP" },
          ],
          members: [],
          children: [],
        },
        {
          id: 75,
          name: "5. Kültürel-Sportif ve Yaz Faaliyetleri Birimi",
          employees: [
            { id: 9037, full_name: "Tuğba Eren", title: "Kültürel Faaliyetler" },
          ],
          members: [],
          children: [],
        },
      ],
    },

    // UHAB
    {
      id: 80,
      name: "Uluslararası Hafızlar Birliği Komisyonu (UHAB)",
      employees: [
        { id: 9038, full_name: "Esra Dilara Şen", title: "UHAB Bşk." },
      ],
      members: [],
      children: [
        {
          id: 81,
          name: "1. Temsilciler Birimi",
          employees: [
            { id: 9039, full_name: "Zeynep Gündüz", title: "Temsilciler" },
          ],
          members: [],
          children: [],
        },
        {
          id: 82,
          name: "2. Eğitim ve Rehberlik Birimi",
          employees: [
            { id: 9040, full_name: "Süheyla Keskin", title: "Eğitim/Rehberlik" },
          ],
          members: [],
          children: [],
        },
        {
          id: 83,
          name: "3. Projeler Birimi",
          employees: [
            { id: 9041, full_name: "Z. Rümeysa Yiğit", title: "Projeler" },
          ],
          members: [],
          children: [],
        },
        {
          id: 84,
          name: "4. Tanıtım ve Medya Birimi",
          employees: [
            { id: 9042, full_name: "Beyza Kalkan", title: "UHAB Medya" },
          ],
          members: [],
          children: [],
        },
        {
          id: 85,
          name: "5. Kültürel ve Sportif Faaliyetler Birimi",
          employees: [
            { id: 9043, full_name: "M. Şura Bozkurt", title: "Kültür & Spor" },
          ],
          members: [],
          children: [],
        },
      ],
    },
  ],
};

function mergePeople(staticNode, apiNode) {
  if (!apiNode) return staticNode;

  const merged = {
    ...staticNode,
    employees: apiNode.employees?.length ? apiNode.employees : staticNode.employees,
    members: apiNode.members?.length ? apiNode.members : staticNode.members,
  };

  if (staticNode.children && staticNode.children.length > 0) {
    merged.children = staticNode.children.map((child) => {
      const match =
        apiNode.children &&
        apiNode.children.find(
          (c) => c.name && c.name.toLowerCase() === child.name.toLowerCase()
        );
      return mergePeople(child, match);
    });
  }

  return merged;
}

const KadinlarOrgChart = () => {
  const [root, setRoot] = useState(FALLBACK_ROOT);
  const [loading, setLoading] = useState(true);
  const slug = "kadinlar";

  useEffect(() => {
    (async () => {
      try {
        const apiData = await fetchOrgChartByName(slug);
        const merged = mergePeople(FALLBACK_ROOT, apiData);
        setRoot(merged);
      } catch (err) {
        setRoot(FALLBACK_ROOT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <HomeHeader />

      <div className="org-page org-page--full">
        <h1>Kadınlar Teşkilat Şeması</h1>
        <p className="org-desc">Birimlerin üzerine gelince üyeleri görürsünüz.</p>

        {loading ? (
          <div className="org-loading">Yükleniyor...</div>
        ) : (
          <div className="org-tree-wrapper org-tree-wrapper--full">
            <div className="tree tree--full">
              <ul>
                <OrgNode node={root} />
              </ul>
            </div>
          </div>
        )}
      </div>

      <HomeFooter />
    </>
  );
};

export default KadinlarOrgChart;
