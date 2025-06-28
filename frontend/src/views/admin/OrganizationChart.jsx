import { useState, useEffect } from "react";
import useAxios from "../../utils/useAxios";
import React from "react";

import UseOrganizationChart from "../../utils/UseOrganizationChart.js";
import AkademiBaseHeader from "../partials/AkademiBaseHeader";
import AkademiBaseFooter from "../partials/AkademiBaseFooter";

function OrganizationChart() {
    const [members, setMembers] = useState([]);
    let members_sort = [];

    function FetchOrganizationMembers() {
        try {
            useAxios()
                .get(`admin/organizationchart/`)
                .then((res) => {
                    members_sort = [];
                    setMembers(res.data);
                    res.data.forEach(MemberSort);
                    UseOrganizationChart(members_sort);
                });
        } catch (error) {
            console.log(error);
        }
    }

    function MemberSort(item) {
        let member = null;
        const baseMember = {
            "Name": item.Name || "-",
            "Email": item.Email || "-",
            "Phone": item.Phone || "-",
            "Designation": item.DesignationText || "-",
            "ImageUrl": item.ImageUrl || "-",
            "IsExpand": item.IsExpand || "-",
            "RatingColor": "#68C2DE"
        };

        if (item.Designation === 1) {
            member = { ...baseMember, "Id": "parent" };
        } else {
            member = { ...baseMember, "Id": item.Designation.toString(), "ReportingPerson": "parent" };
        }

        if (member) members_sort.push(member);
    }

    useEffect(() => {
        FetchOrganizationMembers();
    }, []);

    return (
        <> 
            <AkademiBaseHeader />
            <section className="pt-10 pb-10 bg-gray-50">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-6 text-green-600">Organizasyon Şeması</h1>
                    <div id="diagram" className="shadow-lg rounded-lg bg-white p-4" />
                </div>
            </section>
            <AkademiBaseFooter />
        </>
    );
}

export default OrganizationChart;
