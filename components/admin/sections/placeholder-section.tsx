/** Contenido por defecto de las secciones aún no implementadas. */
export function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="admin-content-placeholder">
      <h1>{title}</h1>
      <p>Sección «{title}» — contenido próximamente.</p>
    </div>
  );
}
