import React, { SetStateAction } from "react";
import { Panel } from "./panel";
import { Section } from "../admin-config";

function VerTodas({
  label = "Ver todas",
  setActive,
}: {
  label?: string;
  setActive?: () => void;
}) {
  return (
    <button type="button" className="dash-link" onClick={() => setActive?.()}>
      {label}
    </button>
  );
}
interface TableCustomProps {
  children: React.ReactNode;
  title: string;
  actionLabel: string;
  setActive?: () => void;
}
const TableCustom = ({
  children,
  title,
  actionLabel,
  setActive,
}: TableCustomProps) => {
  return (
    <Panel
      title={title}
      action={<VerTodas label={actionLabel} setActive={setActive} />}
    >
      <div className="dash-table-wrap">
        <table className="dash-table">{children}</table>
      </div>
    </Panel>
  );
};

export default TableCustom;
