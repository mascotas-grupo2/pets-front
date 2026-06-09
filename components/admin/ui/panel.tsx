type PanelProps = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** Tarjeta con encabezado usada por las secciones del panel. */
export function Panel({ title, action, children, className }: PanelProps) {
  return (
    <section className={`dash-panel${className ? ` ${className}` : ""}`}>
      {title && (
        <div className="dash-panel-head">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
