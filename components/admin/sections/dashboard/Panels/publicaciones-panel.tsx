import { Pill } from "@/components/admin/ui/pill";
import TableCustom from "@/components/admin/ui/TableCustom";
import { Eye, MoreVertical, Pencil } from "lucide-react";
import { PUBLICACIONES } from "../dashboard.data";
interface PanelTableProps {
  setActive?: () => void;
}
const PublicacionesPanel = ({ setActive }: PanelTableProps) => {
  return (
    <TableCustom
      title="Publicaciones recientes"
      actionLabel="Ver todas"
      setActive={() => setActive?.()}
    >
      <thead>
        <tr>
          <th>Publicación</th>
          <th>Tipo</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Vistas</th>
          <th aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {PUBLICACIONES.map((r) => (
          <tr key={r.titulo}>
            <td>
              <span className="dash-user-text">
                <span className="dash-user-name">{r.titulo}</span>
                <span className="dash-user-email">{r.detalle}</span>
              </span>
            </td>
            <td>
              <Pill tone="violet">{r.tipo}</Pill>
            </td>
            <td className="dash-muted">{r.fecha}</td>
            <td>
              <Pill tone={r.estado.tone}>{r.estado.label}</Pill>
            </td>
            <td className="dash-muted">{r.vistas}</td>
            <td className="dash-cell-action">
              <div className="dash-row-actions">
                <button type="button" aria-label="Ver">
                  <Eye size={15} />
                </button>
                <button type="button" aria-label="Editar">
                  <Pencil size={15} />
                </button>
                <button type="button" aria-label="Más">
                  <MoreVertical size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableCustom>
  );
};

export default PublicacionesPanel;
