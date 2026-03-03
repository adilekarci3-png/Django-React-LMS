// src/views/AkademiEgitmen/ESKEPEgitmenDashboard.jsx}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import useUserData from "../plugin/useUserData";
import ESKEPBaseHeader from "../partials/ESKEPBaseHeader";
import ESKEPBaseFooter from "../partials/ESKEPBaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

const MOCK_LIVE = [
  { id:"ml1", title:"Tecvid - Nun Sakin Kuralları", datetime: new Date(Date.now()+2*3600000).toISOString(), platform_url:"#" },
  { id:"ml2", title:"Hafızlık Değerlendirme Seansı", datetime: new Date(Date.now()+26*3600000).toISOString(), platform_url:"#" },
  { id:"ml3", title:"Arapça Konuşma Pratiği", datetime: new Date(Date.now()-3600000).toISOString(), platform_url:"#" },
];
const MOCK_YT = [
  { id:"my1", title:"Tecvid Dersleri - Bölüm 1", videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id:"my2", title:"Hafızlık Programı Tanıtım", videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", created_at: new Date(Date.now()-5*86400000).toISOString() },
  { id:"my3", title:"Arapça Gramer - Fiil Çekimleri", videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", created_at: new Date(Date.now()-9*86400000).toISOString() },
];
const MOCK_VIDEOS = [
  { id:"mv1", title:"Tecvid Ders Kaydı", video_url:"#", duration:1845, file_size:245*1024*1024, created_at: new Date(Date.now()-86400000).toISOString() },
  { id:"mv2", title:"Hafızlık Programı Tanıtım", video_url:"#", duration:732, file_size:98*1024*1024, created_at: new Date(Date.now()-7*86400000).toISOString() },
  { id:"mv3", title:"Arapça Gramer Dersi", video_url:"#", duration:2610, file_size:320*1024*1024, created_at: new Date(Date.now()-14*86400000).toISOString() },
];
const MOCK_CREATED = [
  { id:"mc1", title:"Nun Sakin Kuralları Kaydı", file:"#", duration:2240, file_size:187*1024*1024, created_at: new Date(Date.now()-86400000).toISOString() },
  { id:"mc2", title:"Bakara Suresi 1-20 Tekrar", file:"#", duration:960, file_size:74*1024*1024, created_at: new Date(Date.now()-4*86400000).toISOString() },
  { id:"mc3", title:"Arapça Kelime Bilgisi", file:"#", duration:1540, file_size:130*1024*1024, created_at: new Date(Date.now()-10*86400000).toISOString() },
];
const MOCK_DOCS = [
  { id:"md1", title:"Tecvid Ders Notları", file:"#", created_at: new Date(Date.now()-86400000).toISOString() },
  { id:"md2", title:"Hafızlık Programı Rehberi", file:"#", created_at: new Date(Date.now()-3*86400000).toISOString() },
  { id:"md3", title:"Arapça Gramer Özeti", file:"#", created_at: new Date(Date.now()-7*86400000).toISOString() },
];

function getYtId(url) {
  const m = (url||"").match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function fmtDur(s) {
  if (!s) return null;
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=Math.floor(s%60);
  return h>0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
}
function fmtSize(b) {
  if (!b) return null;
  return b<1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;
}
function fmtDate(d) { return new Date(d).toLocaleDateString("tr-TR"); }
function getLiveStatus(dt) {
  const diff = (new Date(dt)-new Date())/60000;
  if (diff>=-15&&diff<=15) return "live";
  if (diff>15) return "upcoming";
  return "past";
}
function getExt(url) { return (url||"").split(".").pop().split("?")[0].toLowerCase()||""; }

function StatCard({ icon, iconColor, bgColor, label, count, loading, onClick }) {
  return (
    <div className="col-6 col-sm-4 col-lg" style={{cursor:"pointer"}} onClick={onClick}>
      <div className="rounded-3 p-3 h-100 d-flex flex-column align-items-start gap-1 stat-card"
        style={{background:bgColor, transition:"transform .15s,box-shadow .15s", minHeight:100}}>
        <i className={`${icon} ${iconColor} mb-1`} style={{fontSize:22}}></i>
        {loading
          ? <span className="spinner-border spinner-border-sm text-secondary"/>
          : <span className="fw-bold" style={{fontSize:28, lineHeight:1}}>{count ?? "—"}</span>
        }
        <span className="text-muted" style={{fontSize:12}}>{label}</span>
      </div>
    </div>
  );
}

function SectionBlock({ icon, iconColor, title, count, toList, toCreate, isMock, children, navigate }) {
  return (
    <div className="bg-white rounded-3 shadow-sm p-4">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className={`${icon} ${iconColor}`}></i>
          {title}
          <span className="badge bg-light text-secondary border ms-1" style={{fontSize:11}}>{count}</span>
          {/* {isMock && <span className="badge bg-warning text-dark ms-1" style={{fontSize:10}}>Örnek</span>} */}
        </h6>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-success px-2 py-1" style={{fontSize:12}} onClick={() => navigate(toCreate)}>
            <i className="fa-solid fa-plus me-1"></i>Ekle
          </button>
          <button className="btn btn-sm btn-outline-secondary px-2 py-1" style={{fontSize:12}} onClick={() => navigate(toList)}>
            Tümü
          </button>
        </div>
      </div>
      <hr className="mt-2 mb-0"/>
<div className="scroll-list pe-1" style={{ maxHeight: 240, overflowY: "auto", overflowX: "hidden" }}>
  {children}
</div>
    </div>
  );
}

function LiveRow({ item }) {
  const st = getLiveStatus(item.datetime);
  const cls = {live:"bg-danger text-white", upcoming:"bg-success text-white", past:"bg-secondary text-white"}[st];
  const lbl = {live:"Canlı", upcoming:"Yaklaşan", past:"Geçmiş"}[st];
  const fmt = new Intl.DateTimeFormat("tr-TR",{dateStyle:"short",timeStyle:"short"});
  return (
    <div className="d-flex align-items-center gap-2 py-2 border-bottom">
      <span className={`badge ${cls} flex-shrink-0`} style={{fontSize:10,minWidth:56,textAlign:"center"}}>{lbl}</span>
      <div className="flex-grow-1 overflow-hidden">
        <div className="fw-semibold small" style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.title}</div>
        <div className="text-muted" style={{fontSize:11}}>{fmt.format(new Date(item.datetime))}</div>
      </div>
      {item.platform_url && item.platform_url !== "#" && (
        <a href={item.platform_url} target="_blank" rel="noreferrer"
          className={`btn btn-sm flex-shrink-0 ${st==="live"?"btn-danger":"btn-outline-secondary"}`}
          style={{fontSize:11,padding:"2px 8px"}}>
          {st==="live"?"Katıl":"Aç"}
        </a>
      )}
    </div>
  );
}

function YtRow({ item }) {
  const id = getYtId(item.videoUrl||item.url||item.video_url);
  const thumb = id ? `https://img.youtube.com/vi/${id}/default.jpg` : null;
  const embed = id ? `https://www.youtube.com/embed/${id}` : "#";
  return (
    <div className="d-flex align-items-center gap-3 py-2 border-bottom">
      <div className="flex-shrink-0 rounded overflow-hidden bg-light d-flex align-items-center justify-content-center"
        style={{width:60,height:38}}>
        {thumb
          ? <img src={thumb} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <i className="fa-brands fa-youtube text-danger" style={{fontSize:18}}></i>
        }
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="fw-semibold small" style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.title}</div>
        <div className="text-muted" style={{fontSize:11}}>{fmtDate(item.created_at)}</div>
      </div>
      <a href={embed} target="_blank" rel="noreferrer"
        className="btn btn-sm btn-outline-danger flex-shrink-0" style={{fontSize:11,padding:"2px 8px"}}>
        <i className="fa-solid fa-play"></i>
      </a>
    </div>
  );
}

function VideoRow({ item, iconColor }) {
  const url = item.video_url||item.file||item.video_file||"#";
  const dur = fmtDur(item.duration);
  const sz  = fmtSize(item.file_size);
  return (
    <div className="d-flex align-items-center gap-3 py-2 border-bottom">
      <div className="flex-shrink-0 rounded d-flex align-items-center justify-content-center"
        style={{width:60,height:38,background:"#1c1c2e"}}>
        <i className={`fa-solid fa-play ${iconColor}`} style={{fontSize:14,opacity:.7}}></i>
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="fw-semibold small" style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.title||"İsimsiz"}</div>
        <div className="text-muted d-flex gap-2" style={{fontSize:11}}>
          <span>{fmtDate(item.created_at)}</span>
          {dur&&<span>· {dur}</span>}
          {sz&&<span>· {sz}</span>}
        </div>
      </div>
      {url!=="#" && (
        <a href={url} target="_blank" rel="noreferrer"
          className="btn btn-sm btn-outline-secondary flex-shrink-0" style={{fontSize:11,padding:"2px 8px"}}>
          <i className="fa-solid fa-play"></i>
        </a>
      )}
    </div>
  );
}

function DocRow({ item }) {
  const extMap = {
    pdf:{bg:"#fff1f0",color:"#cf1322",label:"PDF"}, doc:{bg:"#e6f4ff",color:"#0958d9",label:"DOC"},
    docx:{bg:"#e6f4ff",color:"#0958d9",label:"DOCX"}, xls:{bg:"#f6ffed",color:"#389e0d",label:"XLS"},
    xlsx:{bg:"#f6ffed",color:"#389e0d",label:"XLSX"}, ppt:{bg:"#fff7e6",color:"#d46b08",label:"PPT"},
    pptx:{bg:"#fff7e6",color:"#d46b08",label:"PPTX"},
  };
  const ext = getExt(item.file);
  const info = extMap[ext]||{bg:"#f0f0f0",color:"#595959",label:ext.toUpperCase()||"?"};
  return (
    <div className="d-flex align-items-center gap-3 py-2 border-bottom">
      <span className="badge rounded-2 px-2 py-1 fw-bold flex-shrink-0"
        style={{background:info.bg,color:info.color,fontSize:10,letterSpacing:.5}}>
        {info.label}
      </span>
      <a href={item.file||"#"} target="_blank" rel="noreferrer"
        className="text-decoration-none text-dark fw-semibold small flex-grow-1"
        style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
        {item.title}
      </a>
      <span className="text-muted flex-shrink-0" style={{fontSize:11}}>{fmtDate(item.created_at)}</span>
    </div>
  );
}

export default function ESKEPEgitmenDashboard() {
  const api      = useAxios();
  const navigate = useNavigate();
  const profile  = useUserData();

  const [data,    setData]    = useState({live:[],yt:[],videos:[],created:[],docs:[]});
  const [counts,  setCounts]  = useState({live:null,yt:null,videos:null,created:null,docs:null});
  const [mocks,   setMocks]   = useState({live:false,yt:false,videos:false,created:false,docs:false});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeGet = async (url) => {
      try { const r = await api.get(url); return Array.isArray(r.data) ? r.data : []; }
      catch { return []; }
    };
    (async () => {
      setLoading(true);
      const [live,yt,videos,created,docs] = await Promise.all([
        safeGet("/live-lessons/"),
        safeGet("educator/video/link/"),
        safeGet("instructor/video/"),
        safeGet("educator/created-video/"),
        safeGet("educator/document/"),
      ]);
      const resolve = (real, mock) => ({
        list:   real.length ? real : mock,
        isMock: !real.length,
        count:  real.length || mock.length,
      });
      const r = {
        live:    resolve(live,    MOCK_LIVE),
        yt:      resolve(yt,      MOCK_YT),
        videos:  resolve(videos,  MOCK_VIDEOS),
        created: resolve(created, MOCK_CREATED),
        docs:    resolve(docs,    MOCK_DOCS),
      };
      setData({ live: r.live.list, yt: r.yt.list, videos: r.videos.list, created: r.created.list, docs: r.docs.list });
      setCounts({live:r.live.count, yt:r.yt.count, videos:r.videos.count, created:r.created.count, docs:r.docs.count});
      setMocks({live:r.live.isMock, yt:r.yt.isMock, videos:r.videos.isMock, created:r.created.isMock, docs:r.docs.isMock});
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  const statCards = [
    {icon:"fa-solid fa-video",        iconColor:"text-danger",    bgColor:"#fff5f5", label:"Canlı Ders",        key:"live",    to:"/eskepegitmen/live-lessons/"},
    {icon:"fa-brands fa-youtube",     iconColor:"text-danger",    bgColor:"#fff5f5", label:"YouTube Video",     key:"yt",      to:"/eskepegitmen/youtube-video-list"},
    {icon:"fa-solid fa-photo-film",   iconColor:"text-info",      bgColor:"#f0fbff", label:"Yüklenen Video",    key:"videos",  to:"/eskepegitmen/video-list"},
    {icon:"fa-solid fa-clapperboard", iconColor:"text-warning",   bgColor:"#fffbf0", label:"Oluşturulan Video", key:"created", to:"/eskepegitmen/created-videos"},
    {icon:"fa-regular fa-file-lines", iconColor:"text-secondary", bgColor:"#f8f9fa", label:"Döküman",           key:"docs",    to:"/eskepegitmen/documents"},
  ];

  return (
    <>
      <style>{`
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.09)!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .35s ease both;}
        .fu1{animation-delay:.04s;} .fu2{animation-delay:.08s;} .fu3{animation-delay:.12s;}
        .fu4{animation-delay:.16s;} .fu5{animation-delay:.20s;} .fu6{animation-delay:.24s;}
        /* İnce özel kaydırma çubuğu */
.scroll-list::-webkit-scrollbar { width: 4px; }
.scroll-list::-webkit-scrollbar-track { background: transparent; }
.scroll-list::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 4px; }
.scroll-list::-webkit-scrollbar-thumb:hover { background: #adb5bd; }
.scroll-list { scrollbar-width: thin; scrollbar-color: #dee2e6 transparent; }
      `}</style>

      <ESKEPBaseHeader />
      <section className="pt-5 pb-5 bg-light">
        <div className="container-xxl">
          <Header />
          <div className="row mt-0 mt-md-4">
            <div className="col-lg-3 col-md-4 col-12 mb-4"><Sidebar /></div>
            <div className="col-lg-9 col-md-8 col-12">

              {/* Başlık */}
              <div className="bg-white rounded-3 shadow-sm p-4 mb-4 d-flex align-items-center gap-3 fu">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{width:50,height:50,background:"#eef2ff"}}>
                  <i className="fa-solid fa-gauge text-primary" style={{fontSize:22}}></i>
                </div>
                <div>
                  <h3 className="mb-1 fw-bold">
                    <i className="fa-solid fa-gauge text-primary me-2"></i>Panel
                  </h3>
                  <p className="text-muted mb-0 small">
                    Hoş geldiniz{profile?.full_name ? `, ${profile.full_name}` : ""}. Tüm içeriklerinizin özeti aşağıda listelenmektedir.
                  </p>
                </div>
              </div>

              {/* Stat Kartları */}
              <div className="row g-3 mb-4 fu fu1">
                {statCards.map((s) => (
                  <StatCard key={s.key} {...s} count={counts[s.key]} loading={loading}
                    onClick={() => navigate(s.to)} />
                ))}
              </div>

              {loading ? (
                <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-5">
                  <span className="spinner-border spinner-border-sm"/> Yükleniyor…
                </div>
              ) : (
                <div className="row g-4">

                  {/* Canlı Dersler */}
                  <div className="col-12 col-xl-6 fu fu2">
                    <SectionBlock icon="fa-solid fa-video" iconColor="text-danger"
                      title="Canlı Dersler" count={counts.live} isMock={mocks.live}
                      toList="/eskepegitmen/live-lessons/" toCreate="/eskepegitmen/canli-ders-ekle/" navigate={navigate}>
                      {data.live.map((item) => <LiveRow key={item.id} item={item}/>)}
                    </SectionBlock>
                  </div>

                  {/* YouTube */}
                  <div className="col-12 col-xl-6 fu fu3">
                    <SectionBlock icon="fa-brands fa-youtube" iconColor="text-danger"
                      title="YouTube Videolarım" count={counts.yt} isMock={mocks.yt}
                      toList="/eskepegitmen/youtube-video-list" toCreate="/eskepegitmen/youtube-video-ekle/" navigate={navigate}>
                      {data.yt.map((item) => <YtRow key={item.id} item={item}/>)}
                    </SectionBlock>
                  </div>

                  {/* Yüklenen Videolar */}
                  <div className="col-12 col-xl-6 fu fu4">
                    <SectionBlock icon="fa-solid fa-photo-film" iconColor="text-info"
                      title="Videolarım" count={counts.videos} isMock={mocks.videos}
                      toList="/eskepegitmen/video-list" toCreate="/eskepegitmen/video-ekle/" navigate={navigate}>
                      {data.videos.map((item) => <VideoRow key={item.id} item={item} iconColor="text-info"/>)}
                    </SectionBlock>
                  </div>

                  {/* Oluşturulan Videolar */}
                  <div className="col-12 col-xl-6 fu fu5">
                    <SectionBlock icon="fa-solid fa-clapperboard" iconColor="text-warning"
                      title="Oluşturduğum Videolar" count={counts.created} isMock={mocks.created}
                      toList="/eskepegitmen/created-videos" toCreate="/eskepegitmen/video-olustur/" navigate={navigate}>
                      {data.created.map((item) => <VideoRow key={item.id} item={item} iconColor="text-warning"/>)}
                    </SectionBlock>
                  </div>

                  {/* Dökümanlar — tam genişlik, 2 sütun */}
                  <div className="col-12 fu fu6">
                    <SectionBlock icon="fa-regular fa-file-lines" iconColor="text-secondary"
                      title="Dökümanlarım" count={counts.docs} isMock={mocks.docs}
                      toList="/eskepegitmen/documents" toCreate="/eskepegitmen/dokuman-ekle/" navigate={navigate}>
                      <div className="row">
                        <div className="col-12 col-md-6">
                          {data.docs.slice(0, Math.ceil(data.docs.length/2)).map((item) => <DocRow key={item.id} item={item}/>)}
                        </div>
                        <div className="col-12 col-md-6">
                          {data.docs.slice(Math.ceil(data.docs.length/2)).map((item) => <DocRow key={item.id} item={item}/>)}
                        </div>
                      </div>
                    </SectionBlock>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <ESKEPBaseFooter />
    </>
  );
}