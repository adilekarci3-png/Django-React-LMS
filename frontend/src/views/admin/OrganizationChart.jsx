import { useState, useEffect } from "react";
import useAxios from "../../utils/useAxios";
import React from "react";

import UseOrganizationChart from "../../utils/UseOrganizationChart.js";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";


function OrganizationChart() {
    const overviewData = [
        {
            "Id": 'parent',
            "Name": "Zafer Yıldırım",
            "Designation": "Gençlik Komisyonu",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            // "ReportingPerson": 'p'
        },
        {
            "Id": 2,
            "Name": "Mehmet Arif Arslan",
            "Designation": "Kuran Kursları Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek2.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 'parent'
        },
        {
            "Id": 3,
            "Name": "Mustafa Sabri Akmenşen",
            "Designation": "Yüksek Öğrenim Hafızlık Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 'parent'
        },
        {
            "Id": 4,
            "Name": "Mehmet Kemal Özgüven",
            "Designation": "Yüksek Öğrenim Hafızlık Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/default.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 'parent'
        },
        {
            "Id": 5,
            "Name": "Zafer Yıldırım",
            "Designation": "Gençlik Komisyonu",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 4
        },
        {
            "Id": 6,
            "Name": "Mehmet Arif Arslan",
            "Designation": "Kuran Kursları Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek2.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 5
        },
        {
            "Id": 7,
            "Name": "Mustafa Sabri Akmenşen",
            "Designation": "Yüksek Öğrenim Hafızlık Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek.jpg",
            "IsExpand": 'true',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 6
        },
        {
            "Id": 8,
            "Name": "Mehmet Kemal Özgüven",
            "Designation": "Yüksek Öğrenim Hafızlık Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/default.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 7
        },
        {
            "Id": 9,
            "Name": "M.Adil El Saidi",
            "Designation": "Uluslararası Hafız Öğrenciler Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek2_9KrjfVE.jpg",
            "IsExpand": 'true',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 7
        },
        {
            "Id": 10,
            "Name": "M.Şeref Akçay",
            "Designation": "Kültürel-Sportif ve Yaz Etkinlikleri Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/default.jpg",
            "IsExpand": 'true',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 7
        },
        {
            "Id": 11,
            "Name": "Bilal Canan",
            "Designation": "Müesseseler Komisyonu",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek8.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 10
        },
        {
            "Id": 12,
            "Name": "Hacı Mehmet Gani",
            "Designation": "Gayri Menkul ve Standartlar Birimi",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek5.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 10
        },
        {
            "Id": 13,
            "Name": "M. Selim Allahverdi",
            "Designation": "Kadınlar Komisyonu Koordinator",
            "ImageUrl": "http://127.0.0.1:8000/media/default.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 10
        },
        {
            "Id": 14,
            "Name": "Enver Osman Kaan",
            "Designation": "Yüksek İstişare Kurulu Başkanı",
            "ImageUrl": "http://127.0.0.1:8000/media/course-file/Haf%C4%B1z_profil_resmi_erkek2_Iy013QS.jpg",
            "IsExpand": 'false',
            "RatingColor": "#68C2DE",
            "ReportingPerson": 13
        }
    ]
    const [members, setMembers] = useState([]);
    let members_sort = [];
    function FetchOrganizationMembers() {
        try {
            useAxios()
                .get(`admin/organizationchart/`)
                .then((res) => {
                    debugger;
                    members_sort = [];
                    setMembers(res.data);
                    res.data.forEach(MemberSort)
                    UseOrganizationChart(members_sort);
                });
        } catch (error) {
            console.log(error);
        }
    };
    function MemberSort(item) {
        if (item.Designation == 1) {
            var member = {
                "Id": "parent",
                "Name": item.Name ? item.Name : "-",
                "Email": item.Email ? item.Email : "-",
                "Phone": item.Phone ? item.Phone : "-",
                "Designation": item.DesignationText ? item.DesignationText : "-",
                "ImageUrl": item.ImageUrl ? item.ImageUrl : "-",
                "IsExpand": item.IsExpand ? item.IsExpand : "-",
                "RatingColor": "#68C2DE"                
            }

        }
        else if (item.Designation == 2) {
            var member = {
                "Id": "2",
                "Name": item.Name ? item.Name : "-",
                "Email": item.Email ? item.Email : "-",
                "Phone": item.Phone ? item.Phone : "-",
                "Designation": item.DesignationText ? item.DesignationText : "-",
                "ImageUrl": item.ImageUrl ? item.ImageUrl : "-",
                "IsExpand": item.IsExpand ? item.IsExpand : "-",
                "RatingColor": "#68C2DE",
                "ReportingPerson": "parent"
            }

        }
        else if (item.Designation == 3) {
            var member = {
                "Id": "3",
                "Name": item.Name ? item.Name : "-",
                "Email": item.Email ? item.Email : "-",
                "Phone": item.Phone ? item.Phone : "-",
                "Designation": item.DesignationText ? item.DesignationText : "-",
                "ImageUrl": item.ImageUrl ? item.ImageUrl : "-",
                "IsExpand": item.IsExpand ? item.IsExpand : "-",
                "RatingColor": "#68C2DE",
                "ReportingPerson": "parent"
            }

        }
        else if (item.Designation == 4) {
            var member = {
                "Id": "4",
                "Name": item.Name ? item.Name : "-",
                "Email": item.Email ? item.Email : "-",
                "Phone": item.Phone ? item.Phone : "-",
                "Designation": item.DesignationText ? item.DesignationText : "-",
                "ImageUrl": item.ImageUrl ? item.ImageUrl : "-",
                "IsExpand": item.IsExpand ? item.IsExpand : "-",
                "RatingColor": "#68C2DE",
                "ReportingPerson": "parent"
            }
        }
        else if (item.Designation == 4) {
            var member = {
                "Id": "5",
                "Name": item.Name ? item.Name : "-",
                "Email": item.Email ? item.Email : "-",
                "Phone": item.Phone ? item.Phone : "-",
                "Designation": item.DesignationText ? item.DesignationText : "-",
                "ImageUrl": item.ImageUrl ? item.ImageUrl : "-",
                "IsExpand": item.IsExpand ? item.IsExpand : "-",
                "RatingColor": "#68C2DE",
                "ReportingPerson": "parent"
            }
        }
        if (member != null) {
            members_sort.push(member);
        }

    };
    useEffect(() => {
        FetchOrganizationMembers();
        console.log(members);

    }, []);
    return (
        <> 
            <BaseHeader />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div id="diagram" />
                </div>
            </section>
            <BaseFooter />
        </>
    );
    return (
        <>

        </>
    );
}

export default OrganizationChart