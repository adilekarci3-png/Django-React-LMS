import React from "react";

import KitapTahliliLecturesTab from "./KitapTahliliLecturesTab";
import KitapTahliliNotesTab from "./KitapTahliliNotesTab";
import KitapTahliliChatTab from "./KitapTahliliChatTab";
import KitapTahliliReviewTab from "./KitapTahliliReviewTab";

function KitapTahliliTabs({ kitaptahlili, questions, studentReview, completionPercentage, fetchOdevDetail }) {
  return (
    <>
      <div className="card-header border-bottom px-4 pt-3 pb-0">
        <ul className="nav nav-bottom-line py-0" id="course-pills-tab" role="tablist">
          {/* Sekmeler */}
        </ul>
      </div>
      <div className="card-body p-sm-4">
        <div className="tab-content" id="course-pills-tabContent">
          <KitapTahliliLecturesTab kitaptahlili={kitaptahlili} completionPercentage={completionPercentage} />
          <KitapTahliliNotesTab kitaptahlili={kitaptahlili} fetchKitapTahliliDetail={fetchKitapTahliliDetail} />
          <KitapTahliliChatTab kitaptahlili={kitaptahlili} questions={questions} fetchKitapTahliliDetail={fetchKitapTahliliDetail} />
          <KitapTahliliReviewTab kitaptahlili={kitaptahlili} studentReview={studentReview} fetchKitapTahliliDetail={fetchKitapTahliliDetail} />
        </div>
      </div>
    </>
  );
}

export default KitapTahliliTabs;
