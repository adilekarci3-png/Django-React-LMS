import React from "react";
import DersSonuRaporuLecturesTab from "./DersSonuRaporuStatusTab";
import DersSonuRaporuNotesTab from "./DersSonuRaporuNotesTab";
import DersSonuRaporuChatTab from "./DersSonuRaporuChatTab";
import DersSonuRaporuReviewTab from "./DersSonuRaporuReviewTab";

function DersSonuRaporuTabs({ derssonuraporu, questions, studentReview, completionPercentage, fetchOdevDetail }) {
  return (
    <>
      <div className="card-header border-bottom px-4 pt-3 pb-0">
        <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
          {/* Sekmeler */}
        </ul>
      </div>
      <div className="card-body p-sm-4">
        <div className="tab-content" id="course-pills-tabContent">
          <DersSonuRaporuLecturesTab derssonuraporu={derssonuraporu} completionPercentage={completionPercentage} />
          <DersSonuRaporuNotesTab derssonuraporu={derssonuraporu} fetchDersSonuRaporuDetail={fetchDersSonuRaporuDetail} />
          <DersSonuRaporuChatTab derssonuraporu={derssonuraporu} questions={questions} fetchDersSonuRaporuDetail={fetchDersSonuRaporuDetail} />
          <DersSonuRaporuReviewTab derssonuraporu={derssonuraporu} studentReview={studentReview} fetchDersSonuRaporuDetail={fetchDersSonuRaporuDetail} />
        </div>
      </div>
    </>
  );
}

export default DersSonuRaporuTabs;
