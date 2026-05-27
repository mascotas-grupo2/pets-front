import { Pill } from "@/components/admin/ui/pill";
import TableCustom from "@/components/admin/ui/TableCustom";
import { ChevronRight } from "lucide-react";
import { compatTone, initials, SOLICITUDES } from "../dashboard.data";

interface PanelTableProps {
  setActive?: () => void;
}
const SolicitudesPanel = ({ setActive }: PanelTableProps) => {
  return (
    <TableCustom
      title="Solicitudes recientes"
      actionLabel="Ver todas"
      setActive={() => setActive?.()}
    >
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Mascota</th>
          <th>Compatibilidad</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th aria-label="Acción" />
        </tr>
      </thead>
      <tbody>
        {SOLICITUDES.map((r) => (
          <tr key={r.usuario}>
            <td>
              <div className="dash-user">
                <span className="dash-avatar" aria-hidden>
                  {initials(r.usuario)}
                </span>
                <span className="dash-user-text">
                  <span className="dash-user-name">{r.usuario}</span>
                  <span className="dash-user-email">{r.email}</span>
                </span>
              </div>
            </td>
            <td>{r.mascota}</td>
            <td>
              <span className={`dash-compat tone-${compatTone(r.compat.pct)}`}>
                {r.compat.pct}%
              </span>
              <span className="dash-compat-label">{r.compat.label}</span>
            </td>
            <td>
              <Pill tone={r.estado.tone}>{r.estado.label}</Pill>
            </td>
            <td className="dash-muted">{r.fecha}</td>
            <td className="dash-cell-action">
              <ChevronRight size={16} aria-hidden />
            </td>
          </tr>
        ))}
      </tbody>
    </TableCustom>
  );
};

export default SolicitudesPanel;
