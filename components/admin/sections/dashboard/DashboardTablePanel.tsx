"use client";

import { Panel } from "../../ui/panel";
import { DataTable } from "../../ui/data-table";
import type { Column } from "../../ui/data-table";

type Props<T> = {
  title: string;
  href?: string;
  columns: Column<T>[];
  data: T[];
  rowKey: (r: T) => string | number;
  loading?: boolean;
};

export function DashboardTablePanel<T>({ title, href, columns, data, rowKey, loading = false }: Props<T>) {
  return (
    <Panel title={title} action={href ? <a className="dash-link" href={href}>Ver todas</a> : undefined}>
      <DataTable columns={columns} data={data} rowKey={rowKey} loading={loading} />
    </Panel>
  );
}
