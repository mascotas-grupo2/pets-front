type PanelProps = {
  title: string;
  /** Acción opcional a la derecha del encabezado (ej. enlace "Ver todas"). */
  action?: React.ReactNode;
  children: React.ReactNode;
};

/** Tarjeta con encabezado usada por las secciones del panel. */
export function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
