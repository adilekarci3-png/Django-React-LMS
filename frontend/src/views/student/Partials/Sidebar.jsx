function Sidebar() {
  return (
    <nav
      className="navbar navbar-expand-md shadow-sm mb-4 mb-lg-0 sidenav min-vh-100 d-flex flex-column align-items-start"
      style={{ position: "sticky", top: 90 }}
    >
      <a
        className="d-xl-none d-lg-none d-md-none text-inherit fw-bold text-decoration-none text-dark p-3"
        href="#"
      >
        Menu
      </a>

      <button
        className="navbar-toggler d-md-none icon-shape icon-sm rounded bg-primary text-light m-3"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidenav"
        aria-controls="sidenav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="bi bi-grid" />
      </button>

      <div className="collapse navbar-collapse p-3" id="sidenav">
        <div className="navbar-nav flex-column w-100 align-items-start">
          <ul className="list-unstyled ms-n2 mb-4">
            {/* ... senin NavLink öğelerin ... */}
          </ul>

          <span className="navbar-header mb-3">Hesap Ayarları</span>

          <ul className="list-unstyled ms-n2 mb-0">
            {/* ... senin diğer NavLink öğelerin ... */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;