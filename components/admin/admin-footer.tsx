export function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="admin-footer">
      <span className="admin-footer-copy">
        © {year} <span className="admin-footer-brand">Huellitas Unidas</span> ·
        Panel de administración
      </span>
      <nav className="admin-footer-links" aria-label="Enlaces del panel">
        {/* <a href="/faq">Ayuda</a>
        <span aria-hidden>·</span>
        <a href="/about">Acerca de</a>
        <span aria-hidden>·</span> */}
        <span className="admin-footer-version">v0.1.0</span>
      </nav>
    </footer>
  );
}
