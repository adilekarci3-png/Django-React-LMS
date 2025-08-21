import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import CommonDetailLayout from "../common/CommonDetailLayout";
import TabContainer from "../common/TabContainer";
import ProjeStatusTab from "../partials/Proje/ProjeStatusTab";
import ProjeNotesTab from "../partials/Proje/ProjeNotesTab";
import ProjeReviewTab from "../partials/Proje/ProjeReviewTab";
import ProjeChatTab from "../partials/Proje/ProjeChatTab";

function ProjeDetail() {
  const { id } = useParams();
  const user = useUserData();
  const [data, setData] = useState(null);
  const [studentReview, setStudentReview] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await useAxios().get(`eskepstajer/kitap-tahlili-detail/${user?.user_id}/${id}/`);
      setData(res.data);
      setStudentReview(res.data.review || null);
    } catch (err) {
      console.error("Detay alınamadı", err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const tabs = [
    { key: "status", title: "Durum", component: <ProjeStatusTab data={data} /> },
    { key: "notes", title: "Notlar", component: <ProjeNotesTab data={data} id={id} fetchDetail={fetchDetail} /> },
    { key: "chat", title: "Konuşma", component: <ProjeChatTab data={data} fetchDetail={fetchDetail} /> },
    { key: "review", title: "Not Ver", component: <ProjeReviewTab data={data} studentReview={studentReview} fetchDetail={fetchDetail} /> },
  ];

  return (
    <CommonDetailLayout
      title={data?.title}
      description={data?.description}
      level={data?.level}
      language={data?.language}
      inserteduser={data?.inserteduser}
      date={data?.date}
    >
      <TabContainer tabs={tabs} />
    </CommonDetailLayout>
  );
}

export default ProjeDetail;
