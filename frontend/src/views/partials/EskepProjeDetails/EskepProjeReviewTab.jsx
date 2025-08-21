import React, { useState, useEffect } from "react";
import useAxios from "../../../utils/useAxios";
import UserData from "../../plugin/UserData";
import Toast from "../../plugin/Toast";

function EskepProjeReviewTab({ proje, studentReview, fetchEskepProjeDetail }) {
  const [createReview, setCreateReview] = useState({
    rating: 1,
    review: "",
  });

  useEffect(() => {
    if (studentReview) {
      setCreateReview({
        rating: studentReview.rating,
        review: studentReview.review,
      });
    }
  }, [studentReview]);

  const handleReviewChange = (e) => {
    setCreateReview({
      ...createReview,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateReviewSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("proje_id", proje.proje?.id);
    formData.append("user_id", UserData()?.user_id);
    formData.append("rating", createReview.rating);
    formData.append("review", createReview.review);

    try {
      await useAxios().post(`eskepstajer/rate-proje/`, formData);
      fetchEskepProjeDetail();
      Toast().fire({
        icon: "success",
        title: "Yorum gönderildi",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReviewSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("proje", proje.proje?.id);
    formData.append("user", UserData()?.user_id);
    formData.append("rating", createReview.rating);
    formData.append("review", createReview.review);

    try {
      await useAxios().patch(
        `eskepstajer/review-detail/${UserData()?.user_id}/${studentReview?.id}/`,
        formData
      );
      fetchEskepProjeDetail();
      Toast().fire({
        icon: "success",
        title: "Yorum güncellendi",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h5 className="mb-3">Not Ver</h5>

      <form
        className="row g-3"
        onSubmit={
          studentReview ? handleUpdateReviewSubmit : handleCreateReviewSubmit
        }
      >
        {/* Rating */}
        <div className="col-12">
          <label className="form-label">Puan</label>
          <select
            name="rating"
            className="form-select"
            value={createReview.rating}
            onChange={handleReviewChange}
          >
            <option value={1}>★☆☆☆☆ (1/5)</option>
            <option value={2}>★★☆☆☆ (2/5)</option>
            <option value={3}>★★★☆☆ (3/5)</option>
            <option value={4}>★★★★☆ (4/5)</option>
            <option value={5}>★★★★★ (5/5)</option>
          </select>
        </div>

        {/* Comment */}
        <div className="col-12">
          <label className="form-label">Yorum</label>
          <textarea
            name="review"
            rows="4"
            className="form-control"
            placeholder="Yorumunuzu yazınız..."
            value={createReview.review}
            onChange={handleReviewChange}
          />
        </div>

        {/* Button */}
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {studentReview ? "Yorumu Güncelle" : "Not Ver"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EskepProjeReviewTab;
