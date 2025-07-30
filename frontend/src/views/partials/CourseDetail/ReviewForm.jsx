// ReviewForm.jsx
import React, { useState } from "react";
import useAxios from "../../../utils/useAxios";
import Swal from "sweetalert2";
import UserData from "../../plugin/UserData";

function ReviewForm({ course, refresh }) {
  debugger;
  const [review, setReview] = useState({
    rating: course.review?.rating || 1,
    review: course.review?.review || "",
  });
  const api = useAxios();
  const user_id = UserData().user_id;
  
  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    debugger;
    e.preventDefault();
    const form = new FormData();
    form.append("course_id", course.id);
    form.append("user_id", user_id);
    form.append("rating", review.rating);
    form.append("review", review.review);

    if (course.review?.id) {
      await api.patch(`student/review-detail/${UserData().user_id}/${course.review.id}/`, form);
      Swal.fire({ icon: "success", title: "Yorum güncellendi" });
    } else {
      await api.post(`student/rate-course/`, form);
      Swal.fire({ icon: "success", title: "Yorum eklendi" });
    }
    refresh();
  };

  return (
    <form className="p-3" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Puanlama</label>
        <select
          className="form-select"
          name="rating"
          value={review.rating}
          onChange={handleChange}
        >
          <option value={1}>★☆☆☆☆ (1/5)</option>
          <option value={2}>★★☆☆☆ (2/5)</option>
          <option value={3}>★★★☆☆ (3/5)</option>
          <option value={4}>★★★★☆ (4/5)</option>
          <option value={5}>★★★★★ (5/5)</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Yorum</label>
        <textarea
          className="form-control"
          name="review"
          rows="4"
          value={review.review}
          onChange={handleChange}
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary">
        {course.review ? "Yorumu Güncelle" : "Yorum Yap"}
      </button>
    </form>
  );
}

export default ReviewForm;
