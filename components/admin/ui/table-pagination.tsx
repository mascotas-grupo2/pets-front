import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  onPage: (n: number) => void;
};

export function TablePagination({
  page,
  totalPages,
  total,
  desde,
  hasta,
  onPage,
}: Props) {
  if (total === 0) return null;

  return (
    <div className="mtable-foot">
      {totalPages > 1 && (
        <div className="mtable-pages">
          <button
            type="button"
            className="mtable-page-btn"
            aria-label="Anterior"
            disabled={page <= 1}
            onClick={() => onPage(Math.max(1, page - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`mtable-page-btn${n === page ? " active" : ""}`}
              aria-current={n === page ? "page" : undefined}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="mtable-page-btn"
            aria-label="Siguiente"
            disabled={page >= totalPages}
            onClick={() => onPage(Math.min(totalPages, page + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      <span className="mtable-count">
        Mostrando {desde} a {hasta} de {total}
      </span>
    </div>
  );
}
