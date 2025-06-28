function HafizDersListesi({ hafizId, onClose }) {
  const [dersler, setDersler] = useState([]);
  const api = useAxios();

  useEffect(() => {
    const fetchDersler = async () => {
      const res = await api.get(`hafizlar/${hafizId}/dersler/`);
      setDersler(res.data);
    };
    fetchDersler();
  }, [hafizId]);

  return (
    <div className="modal show d-block" style={{ background: "#00000099" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <h5>Ders Listesi</h5>
          <ul>
            {dersler.map((ders) => (
              <li key={ders.id}>
                {ders.tarih} - {ders.konu}
              </li>
            ))}
          </ul>
          <button className="btn btn-outline-secondary mt-2" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
