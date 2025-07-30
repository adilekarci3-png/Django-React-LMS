import React from "react";
import moment from "moment";

function DiscussionTab({ questions, handleSearchQuestion, handleQuestionShow, handleConversationShow }) {
  return (
    <div className="tab-pane fade" id="course-pills-3" role="tabpanel" aria-labelledby="course-pills-tab-3">
      <div className="card">
        <div className="card-header border-bottom p-0 pb-3">
          <h4 className="mb-3 p-3">Müzakere</h4>
          <form className="row g-4 p-3">
            <div className="col-sm-6 col-lg-9">
              <div className="position-relative">
                <input
                  className="form-control pe-5 bg-transparent"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  onChange={handleSearchQuestion}
                />
                <button
                  className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                  type="submit"
                >
                  <i className="fas fa-search fs-6" />
                </button>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <button
                onClick={handleQuestionShow}
                className="btn btn-primary mb-0 w-100"
                type="button"
              >
                Soru Sor
              </button>
            </div>
          </form>
        </div>

        <div className="card-body p-0 pt-3">
          <div className="vstack gap-3 p-3">
            {questions?.map((q) => (
              <div className="shadow rounded-3 p-3" key={q.id}>
                <div className="d-sm-flex justify-content-sm-between mb-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm flex-shrink-0"></div>
                    <div className="ms-2">
                      <h6 className="mb-0">
                        <span className="text-decoration-none text-dark">
                          {q.profile.full_name}
                        </span>
                      </h6>
                      <small>{moment(q.date).format("DD MMM, YYYY")}</small>
                    </div>
                  </div>
                </div>
                <h5>{q.title}</h5>
                <button
                  className="btn btn-primary btn-sm mb-3 mt-3"
                  onClick={() => handleConversationShow(q)}
                >
                  Join Conversation <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscussionTab;
