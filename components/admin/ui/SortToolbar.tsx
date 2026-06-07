type SortDirection = "asc" | "desc";
type SortOrder<Key extends string> = { key: Key; direction: SortDirection };

type SortColumn<Key extends string> = {
  key: Key;
  label: string;
  sortable?: boolean;
};

type SortToolbarProps<Key extends string> = {
  columns: SortColumn<Key>[];
  sort: SortOrder<Key>[];
  onChange: (next: SortOrder<Key>[]) => void;
};

export function SortToolbar<Key extends string>({
  columns,
  sort,
  onChange,
}: SortToolbarProps<Key>) {
  const handleToggle = (column: Key) => {
    const existing = sort.find((item) => item.key === column);
    let next: SortOrder<Key>[];

    if (!existing) {
      next = [{ key: column, direction: "asc" }, ...sort];
    } else if (existing.direction === "asc") {
      next = sort.map((item) =>
        item.key === column ? { ...item, direction: "desc" } : item,
      );
    } else {
      next = sort.filter((item) => item.key !== column);
    }

    onChange(next);
  };

  return (
    <div className="sort-toolbar">
      {columns.map((column) => {
        const active = sort.find((item) => item.key === column.key);
        return (
          <button
            key={column.key}
            type="button"
            disabled={!column.sortable}
            onClick={() => handleToggle(column.key)}
            className={`sort-button ${active ? "active" : ""}`}
          >
            {column.label}
            {active ? (
              <span>{active.direction === "asc" ? "↑" : "↓"}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
