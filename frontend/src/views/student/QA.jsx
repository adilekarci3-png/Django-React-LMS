import React from 'react'
import { Link } from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'

function QA() {
  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          {/* Header Here */}
          <Header />
          <div className="row mt-0 mt-md-4">
            {/* Sidebar Here */}
            <Sidebar />
            <div className="col-lg-10 col-md-8 col-12">
              <h4 className="mb-0 mb-4"> <i className='fas fa-envelope'></i> Soru ve Cevap</h4>

              <div className="card mb-4">
                <div className="card-header">
                  <span>Tüm Sorular ve Cevaplar burada listelenmiştir</span>
                </div>
                <div className="table-responsive overflow-y-hidden">
                  <table className="table mb-0 text-nowrap table-hover table-centered text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Kurslar</th>
                        <th>Sorular</th>
                        <th>İşlem</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <a href="#">
                                <img
                                  src="https://geeksui.codescandy.com/geeks/assets/images/course/course-angular.jpg"
                                  alt="course"
                                  className="rounded img-4by3-lg"
                                  style={{ width: "100px", height: "70px", borderRadius: "50%", objectFit: "cover" }}
                                />
                              </a>
                            </div>
                            <div className="ms-3">
                              <h4 className="mb-1 h5">
                                <a href="#" className="text-inherit text-decoration-none text-dark">
                                  Yasin Süresi Tefsiri
                                </a>
                              </h4>
                            </div>
                          </div>
                        </td>
                        <td><p className='mt-3'>5</p></td>
                        <td>
                          <Link to={`/student/question-answer/course_id/`} className='btn btn-primary btn-sm mt-3'>Sohbete Katılın <i className='fas fa-arrow-right'></i></Link>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <a href="#">
                                <img
                                  src="https://geeksui.codescandy.com/geeks/assets/images/course/course-react.jpg"
                                  alt="course"
                                  className="rounded img-4by3-lg"
                                  style={{ width: "100px", height: "70px", borderRadius: "50%", objectFit: "cover" }}
                                />
                              </a>
                            </div>
                            <div className="ms-3">
                              <h4 className="mb-1 h5">
                                <a href="#" className="text-inherit text-decoration-none text-dark">
                                  Ali İmran Süresi Tefsiri
                                </a>
                              </h4>
                            </div>
                          </div>
                        </td>
                        <td><p className='mt-3'>5</p></td>
                        <td>
                          <Link to={`/student/question-answer/course_id/`} className='btn btn-primary btn-sm mt-3'>Sohbete Katılın <i className='fas fa-arrow-right'></i></Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />
    </>
  )
}

export default QA