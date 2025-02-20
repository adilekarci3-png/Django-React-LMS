import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import BaseHeader from "../partials/ESKEPBaseHeader";
import BaseFooter from "../partials/ESKEPBaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
//import "../../assets/css/derssonuanket.css";
import UserData from "../plugin/UserData";

const DersSonuAnketi = () => {
    // Define the questions
    const questions = [
        { id: 1, question: "What is your favorite color?", options: ["Red", "Blue", "Green", "Yellow"] },
        { id: 2, question: "What is your favorite animal?", options: ["Dog", "Cat", "Bird", "Fish"] },
        { id: 3, question: "Which season do you prefer?", options: ["Spring", "Summer", "Autumn", "Winter"] },
    ];

    // State to store selected answers
    const [answers, setAnswers] = useState({});

    // Handle answer selection
    const handleAnswer = (questionId, option) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: option
        }));
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Submitted Answers:", answers);
        // You can also send answers to a server or process them further here
    };
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
                  {/* Card */}
                  <div className="card">
                    {/* Card header */}
                    <div className="card-header">
                      <h3 className="mb-0">Ders Sonu Anket</h3>
                      <p className="mb-0">
                      Anket Sorularını Cevaplayınız
                      </p>
                    </div>
                    {/* Card body */}
                    <form className="card-body" onSubmit={handleSubmit}>
                      <div className="d-lg-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center mb-4 mb-lg-0">
                          
                          <div className="ms-3">
                            <h4 className="mb-0">Ders Sonu Anketi</h4>
                            <p className="mb-0">
                            PNG veya JPG, 800 pikselden geniş ve uzun olamaz.
                            </p>
                            {/* <input
                              type="file"
                              className="form-control mt-3"
                              name="image"
                              onChange={handleFileChange}
                              id=""
                            /> */}
                            {questions.map(q => (
                    <div key={q.id} style={{ marginBottom: "20px" }}>
                        <h3>{q.question}</h3>
                        {q.options.map(option => (
                            <label key={option} style={{ display: "block" }}>
                                <input
                                    type="radio"
                                    name={`question-${q.id}`}
                                    value={option}
                                    checked={answers[q.id] === option}
                                    onChange={() => handleAnswer(q.id, option)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                ))}
                <button type="submit">Submit</button>
                          </div>
                        </div>
                      </div>
                      <hr className="my-5" />
                      <div>
                        
                        {/* Form */}
                        <div className="row gx-3">
                          {/* First name */}
                          <div className="mb-3 col-12 col-md-12">
                           
                            {/* <input
                              type="text"
                              id="fname"
                              className="form-control"
                              placeholder="Adınız"
                              required=""
                              value={profileData.full_name}
                              onChange={handleProfileChange}
                              name="full_name"
                            /> */}
                            <div className="invalid-feedback">
                              Adınızı Giriniz
                            </div>
                          </div>
                          {/* Last name */}
                          <div className="mb-3 col-12 col-md-12">
                            
                            {/* <textarea
                              onChange={handleProfileChange}
                              name="about"
                              id=""
                              cols="30"
                              rows="5"
                              className="form-control"
                              value={profileData.about}
                            ></textarea> */}
                            
                          </div>
    
                          {/* Country */}
                          <div className="mb-3 col-12 col-md-12">
                            <label className="form-label" htmlFor="editCountry">
                              Ülke
                            </label>
                            {/* <input
                              type="text"
                              id="country"
                              className="form-control"
                              placeholder="Ülke"
                              required=""
                              value={profileData.country}
                              onChange={handleProfileChange}
                              name="country"
                            /> */}
                            <div className="invalid-feedback">
                              Lütfen Ülke Seçiniz
                            </div>
                          </div>
                          <div className="col-12">
                            {/* Button */}
                            <button className="btn btn-primary" type="submit">
                              Profili Güncelle <i className="fas fa-check-circle"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          <BaseFooter />
        </>
      );
    return (
        <div>
            <h1>Ders Sonu Anket</h1>
            
        </div>
    );
};

export default DersSonuAnketi;
