// LectureList.jsx
import React from "react";

import UserData from "../../plugin/UserData";
import useAxios from "../../../utils/useAxios";
import Swal from "sweetalert2";

function LectureList({ course, completionPercentage, setShowLecture, setVariantItem, refresh }) {
  const api = useAxios();

  const handleMarkLessonAsCompleted = async (variantItemId) => {
    const formdata = new FormData();
    formdata.append("user_id", UserData()?.user_id || 0);
    formdata.append("course_id", course.course?.id);
    formdata.append("variant_item_id", variantItemId);

    try {
      await api.post("student/course-completed/", formdata);
      Swal.fire({ icon: "success", title: "Ders tamamlandı" });
      refresh();
    } catch (error) {
      console.error("Tamamlama hatası:", error);
    }
  };

  return (
    <div className="accordion accordion-icon accordion-border" id="accordionExample2">
      <div className="progress mb-3">
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${completionPercentage}%` }}
        >
          {completionPercentage}%
        </div>
      </div>

      {course?.curriculum?.map((c, i) => (
        <div className="accordion-item mb-3 p-3 bg-light" key={i}>
          <h6 className="accordion-header font-base">
            <button
              className="accordfion-button p-3 w-100 bg-light btn border fw-bold rounded d-sm-flex d-inline-block collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${c.variant_id}`}
            >
              {c.title}
              <span className="small ms-2">({c.variant_items?.length} Ders)</span>
            </button>
          </h6>

          <div
            id={`collapse-${c.variant_id}`}
            className="accordion-collapse collapse show"
          >
            <div className="accordion-body mt-3">
              {c.variant_items?.map((l, idx) => (
                <div className="d-flex justify-content-between align-items-center" key={idx}>
                  <div className="position-relative d-flex align-items-center">
                    <button
                      onClick={() => {
                        setVariantItem(l);
                        setShowLecture(true);
                      }}
                      className="btn btn-danger-soft btn-round btn-sm mb-0 position-static"
                    >
                      <i className="fas fa-play me-0" />
                    </button>
                    <span className="ms-2 mb-0 h6 fw-light">
                      {l.title}
                    </span>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0">{l.content_duration || "0m 0s"}</p>
                    <input
                      type="checkbox"
                      className="form-check-input ms-2"
                      checked={course.completed_lesson?.some((cl) => cl.variant_item.id === l.id)}
                      onChange={() => handleMarkLessonAsCompleted(l.variant_item_id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LectureList;