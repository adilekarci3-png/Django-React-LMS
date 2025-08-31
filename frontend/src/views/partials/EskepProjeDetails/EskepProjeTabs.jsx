import React from "react";

import EskepProjeLecturesTab from "./EskepProjeLecturesTab";
import EskepProjeNotesTab from "./EskepProjeNotesTab";
import EskepProjeChatTab from "./EskepProjeChatTab";
import EskepProjeReviewTab from "./EskepProjeReviewTab";

function EskepProjeTabs({ eskepproje, questions, studentReview, completionPercentage, fetchEskepProjeDetail }) {
  return (
    <>
      <div className="card-header border-bottom px-4 pt-3 pb-0">
        <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
          {/* Sekmeler */}
        </ul>
      </div>
      <div className="card-body p-sm-4">
        <div className="tab-content" id="course-pills-tabContent">
          <EskepProjeLecturesTab eskepproje={eskepproje} completionPercentage={completionPercentage} />
          <EskepProjeNotesTab eskepproje={eskepproje} fetchEskepProjeDetail={fetchEskepProjeDetail} />
          <EskepProjeChatTab eskepproje={eskepproje} questions={questions} fetchEskepProjeDetail={fetchEskepProjeDetail} />
          <EskepProjeReviewTab eskepproje={eskepproje} studentReview={studentReview} fetchEskepProjeDetail={fetchEskepProjeDetail} />
        </div>
      </div>
    </>
  );
}

export default EskepProjeTabs;
