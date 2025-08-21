import React from "react";

function LecturesTab({ course, handleShow, handleMarkLessonAsCompleted }) {
    // const completionPercentage = ((course.completed_lesson?.length || 0) / (course.lectures?.length || 1)) * 100;

    return (
        <div className="tab-pane fade show active" id="course-pills-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
            <div className="accordion accordion-icon accordion-border" id="accordionExample2">
                <div className="progress mb-3">
                    {/* <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${completionPercentage.toFixed(0)}%` }}
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        {completionPercentage.toFixed(0)}%
                    </div> */}
                </div>
                {course?.curriculum?.map((c) => (
                    <div className="accordion-item mb-3 p-3 bg-light" key={c.variant_id}>
                        <h6 className="accordion-header font-base">
                            <button
                                className="accordfion-button p-3 w-100 bg-light btn border fw-bold rounded d-sm-flex d-inline-block collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${c.variant_id}`}
                            >
                                {c.title}
                                <span className="small ms-0 ms-sm-2">
                                    ({c.variant_items?.length} Lecture{c.variant_items?.length > 1 && "s"})
                                </span>
                            </button>
                        </h6>
                        <div id={`collapse-${c.variant_id}`} className="accordion-collapse collapse show">
                            <div className="accordion-body mt-3">
                                {c.variant_items?.map((l) => {
                                    const isCompleted = course.completed_lesson?.some(
                                        (cl) => parseInt(cl.variant_item?.id) === parseInt(l.id)
                                    );

                                    return (
                                        <React.Fragment key={l.id}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="position-relative d-flex align-items-center">
                                                    <button
                                                        onClick={() => handleShow(l)}
                                                        className="btn btn-danger-soft btn-round btn-sm mb-0 stretched-link position-static"
                                                    >
                                                        <i className="fas fa-play me-0" />
                                                    </button>
                                                    <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-100px w-sm-200px w-md-400px">
                                                        {l.title || "Başlıksız Ders"}
                                                    </span>
                                                </div>
                                                <div className="d-flex">
                                                    <p className="mb-0">{l.content_duration || "0m 0s"}</p>
                                                    <label htmlFor={`checkbox-${l.id}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input ms-2"
                                                            onChange={() => {
                                                                console.log("Checkbox tıklandı", l.id);
                                                                console.log("Karşılaştırılıyor:", {
                                                                    fromLesson: l.id,
                                                                    completedList: course.completed_lesson?.map((cl) => cl.variant_item?.id),
                                                                });
                                                                handleMarkLessonAsCompleted({
                                                                    variant_item_id: l.variant_item_id,
                                                                    course_id: course.course?.id || course.course,
                                                                    user_id: course.user,
                                                                });
                                                            }}
                                                            checked={isCompleted}
                                                        />
                                                        <span className="ms-2">Dersi tamamladım</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <hr />
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LecturesTab;
