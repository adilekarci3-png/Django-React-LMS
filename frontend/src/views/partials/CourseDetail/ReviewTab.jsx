import React from "react";

function ReviewTab({ studentReview, course, createReview, handleReviewChange, handleCreateReviewSubmit, handleUpdateReviewSubmit }) {
  return (
    <div className="tab-pane fade" id="course-pills-4" role="tabpanel" aria-labelledby="course-pills-tab-4">
      <div className="card">
        <div className="card-header border-bottom p-0 pb-3">
          <h4 className="mb-3 p-3">Fikir Beyan Et :) {studentReview?.rating}</h4>
          <div className="mt-2">
            {!studentReview && (
              <form className="row g-3 p-3" onSubmit={handleCreateReviewSubmit}>
                <div className="col-12 bg-light-input">
                  <select
                    className="form-select"
                    onChange={handleReviewChange}
                    name="rating"
                    defaultValue={createReview?.rating || 1}
                  >
                    <option value={1}>★☆☆☆☆ (1/5)</option>
                    <option value={2}>★★☆☆☆ (2/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={5}>★★★★★ (5/5)</option>
                  </select>
                </div>
                <div className="col-12 bg-light-input">
                  <textarea
                    className="form-control"
                    placeholder="Your review"
                    rows={3}
                    onChange={handleReviewChange}
                    name="review"
                    defaultValue={createReview?.review}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary mb-0">
                    Post Review
                  </button>
                </div>
              </form>
            )}

            {studentReview && (
              <form className="row g-3 p-3" onSubmit={handleUpdateReviewSubmit}>
                <div className="col-12 bg-light-input">
                  <select
                    className="form-select"
                    onChange={handleReviewChange}
                    name="rating"
                    value={createReview?.rating || studentReview?.rating}
                  >
                    <option value={1}>★☆☆☆☆ (1/5)</option>
                    <option value={2}>★★☆☆☆ (2/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={5}>★★★★★ (5/5)</option>
                  </select>
                </div>
                <div className="col-12 bg-light-input">
                  <textarea
                    className="form-control"
                    placeholder="Your review"
                    rows={3}
                    onChange={handleReviewChange}
                    name="review"
                    defaultValue={studentReview?.review}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary mb-0">
                    Fikrini Güncelle
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewTab;
