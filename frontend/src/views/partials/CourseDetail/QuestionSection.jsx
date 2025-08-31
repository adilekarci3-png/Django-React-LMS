import React, { useState } from "react";
import moment from "moment";
import "moment/locale/tr";

export default function QuestionSection({ course, onOpenConversation, openAskModal, refresh }) {
  debugger;
  const [query, setQuery] = useState("");

  const filtered = course?.question_answer?.filter((q) =>
    (q.title || "").toLowerCase().includes(query.toLowerCase())
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
        <button
          type="button"                              // <-- eklendi
          className="btn btn-primary ms-3"
          onClick={(e) => { e.preventDefault(); openAskModal(); }}
        >
          Soru Sor
        </button>
      </div>

      {filtered?.length > 0 ? (
        filtered.map((q) => (
          <div key={q.id ?? q.qa_id ?? q.title} className="card p-3 mb-3">
            <h6 className="mb-1">{q.title}</h6>
            <small className="text-muted mb-2 d-block">
              {q.profile?.full_name} - {moment(q.date).format("DD MMM YYYY")}
            </small>
            <button
              type="button"                            // <-- eklendi
              className="btn btn-outline-primary btn-sm"
              onClick={(e) => {
                e.preventDefault();
                onOpenConversation(q);
              }}
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
