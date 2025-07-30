import React, { useState } from "react";
import moment from "moment";

function QuestionSection({ course, setModal, openAskModal, refresh }) {
  const [query, setQuery] = useState("");

  const filtered = course?.question_answer?.filter((q) =>
    q.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="search"
          className="form-control w-75"
          placeholder="Sorularda ara..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary ms-3" onClick={openAskModal}>
          Soru Sor
        </button>
      </div>

      {filtered?.length > 0 ? (
        filtered.map((q, i) => (
          <div key={i} className="card p-3 mb-3">
            <h6 className="mb-1">{q.title}</h6>
            <small className="text-muted mb-2 d-block">
              {q.profile.full_name} - {moment(q.date).format("DD MMM YYYY")}
            </small>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setModal({ show: true, selected: q })}
            >
              Konuşmaya Katıl
            </button>
          </div>
        ))
      ) : (
        <p className="mt-3">Soru bulunamadı.</p>
      )}
    </div>
  );
}

export default QuestionSection;
