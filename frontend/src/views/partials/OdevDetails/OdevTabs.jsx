import React from "react";
import OdevLecturesTab from "./OdevLecturesTab";
import OdevNotesTab from "./OdevNotesTab";
import OdevChatTab from "./OdevChatTab";
import OdevReviewTab from "./OdevReviewTab";

function OdevTabs({ odev, questions, studentReview, completionPercentage, fetchOdevDetail }) {
  return (
    <>
      <div className="card-header border-bottom px-4 pt-3 pb-0">
        <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
          {/* Sekmeler */}
        </ul>
      </div>
      <div className="card-body p-sm-4">
        <div className="tab-content" id="course-pills-tabContent">
          <OdevLecturesTab odev={odev} completionPercentage={completionPercentage} />
          <OdevNotesTab odev={odev} fetchOdevDetail={fetchOdevDetail} />
          <OdevChatTab odev={odev} questions={questions} fetchOdevDetail={fetchOdevDetail} />
          <OdevReviewTab odev={odev} studentReview={studentReview} fetchOdevDetail={fetchOdevDetail} />
        </div>
      </div>
    </>
  );
}

export default OdevTabs;
