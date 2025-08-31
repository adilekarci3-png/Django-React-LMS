import React, { useEffect, useState,useMemo } from "react";
import { useParams } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";

import CommonDetailLayout from "../Partials/CommonDetail/CommonDetailLayout";
import DersSonuRaporuStatusTab from "../partials/DersSonuRaporuDetail/DersSonuRaporuStatusTab";
import DersSonuRaporuNotesTab from "../partials/DersSonuRaporuDetail/DersSonuRaporuNotesTab";
import DersSonuRaporuReviewTab from "../partials/DersSonuRaporuDetail/DersSonuRaporuReviewTab";
import DersSonuRaporuChatTab from "../partials/DersSonuRaporuDetail/DersSonuRaporuChatTab";
import DersSonuRaporuOverviewTab from "../partials/DersSonuRaporuDetail/DersSonuRaporuOverviewTab";
import { TabContainer } from "../Partials/CommonDetail/TabContainer";

function DersSonuRaporuDetail() {
  const { koordinator_id, derssonuraporu_id } = useParams();
  const user = useUserData();
  const [data, setData] = useState(null);
  const [studentReview, setStudentReview] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await useAxios().get(`eskepstajer/derssonuraporu-detail/${koordinator_id}/${derssonuraporu_id}/`);
      setData(res.data);
      console.log(res.data);
      setStudentReview(res.data.review || null);
    } catch (err) {
      console.error("Detay alınamadı", err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [derssonuraporu_id, user?.user_id]);

   const tabs = useMemo(() => ([
    { key: "overview", title: "Özet", component: <DersSonuRaporuOverviewTab derssonuraporu={data} /> },
    { key: "status", title: "Durum", component: <DersSonuRaporuStatusTab derssonuraporu={data} /> },
    { key: "notes", title: "Notlar", component: <DersSonuRaporuNotesTab derssonuraporu={data} fetchDersSonuRaporuDetail={fetchDetail} id={derssonuraporu_id} /> },
    { key: "chat", title: "Konuşma", component: <DersSonuRaporuChatTab derssonuraporu={data} fetchDersSonuRaporuDetail={fetchDetail} /> },
    { key: "review", title: "Not Ver", component: <DersSonuRaporuReviewTab derssonuraporu={data} studentReview={studentReview} fetchDersSonuRaporuDetail={fetchDetail} /> },
  ]), [data, derssonuraporu_id, studentReview]);

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

export default DersSonuRaporuDetail;
