import { Pill } from "@/components/admin/ui/pill";
import TableCustom from "@/components/admin/ui/TableCustom";
import { SEGUIMIENTOS } from "../dashboard.data";
interface PanelTableProps {
  setActive?: () => void;
}
const SeguimientosPanel = ({ setActive }: PanelTableProps) => {
  return (
    <TableCustom
      title="Seguimientos próximos"
      actionLabel="Ver todos"
      setActive={() => setActive?.()}
    >
      <thead>
        <tr>
          <th>Mascota</th>
          <th>Tipo</th>
          <th>Fecha y hora</th>
          <th>Adoptante</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {SEGUIMIENTOS.map((r) => (
          <tr key={r.mascota}>
            <td className="dash-strong">{r.mascota}</td>
            <td>{r.tipo}</td>
            <td className="dash-muted">{r.fechaHora}</td>
            <td>{r.adoptante}</td>
            <td>
              <Pill tone="blue">Programada</Pill>
            </td>
          </tr>
        ))}
      </tbody>
    </TableCustom>
  );
};

export default SeguimientosPanel;
