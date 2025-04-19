import React, { useRef, useState } from 'react';
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader"; // Header'ı import et
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter"; // Footer'ı import et
import Sidebar from "./Partials/Sidebar"; // Sidebar'ı import et

function WebCamVideoRecorder() {
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(""); // Kullanıcı adı state'i

  // Kamera akışını başlatma
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;

      // MediaRecorder ile video kaydetme işlemi başlat
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        setVideoChunks((prevChunks) => [...prevChunks, e.data]);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
        setVideoUrl(URL.createObjectURL(videoBlob));
      };

      setMediaRecorder(recorder);
    } catch (err) {
      console.error("Kamera başlatılamadı: ", err);
    }
  };

  // Kayıt başlatma
  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Kayıt durdurma
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Sohbete mesaj ekleme
  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setChatMessages((prevMessages) => [...prevMessages, { username, text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <>
      <ESKEPBaseHeader />
      <section className="pt-5 pb-5">
        <div className="container">
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <div className="col-lg-9 col-md-8 col-12">
              <div className="card mt-4">
                <div className="card-header">
                  <h3 className="mb-0">Eğitim Videosu Oluşturma</h3>
                </div>
                <div className="card-body">
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      width="100%"
                      height="auto"
                      autoPlay
                      muted
                      style={{ border: '1px solid #ccc' }}
                    />
                  </div>

                  <div className="controls mt-3">
                    <button onClick={startCamera} className="btn btn-primary">
                      Kamerayı Başlat
                    </button>

                    {!isRecording ? (
                      <button onClick={startRecording} className="btn btn-success ms-2">
                        Kayda Başla
                      </button>
                    ) : (
                      <button onClick={stopRecording} className="btn btn-danger ms-2">
                        Kaydı Durdur
                      </button>
                    )}
                  </div>

                  {videoUrl && (
                    <div className="video-download mt-3">
                      <a href={videoUrl} download="video.mp4" className="btn btn-info">
                        Videoyu İndir
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kullanıcı Adı ve Sohbet Alanı */}
            <div className="col-lg-3 col-md-4 col-12 mt-4 mt-md-0">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Sohbet</h5>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                  <ul className="list-unstyled">
                    {chatMessages.map((msg, index) => (
                      <li key={index} className="mb-2">
                        <div className="chat-message">
                          <strong>{msg.username}: </strong>{msg.text}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-footer">
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Kullanıcı Adı"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mesaj yaz..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !username.trim()}
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}

export default WebCamVideoRecorder;
