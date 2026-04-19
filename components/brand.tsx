import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Huellitas Unidas">
      <span className="brand-mark" aria-hidden>
        🐾
      </span>
      <span className="brand-name">
        <span className="row1">Huellitas</span>
        <span className="row2">Unidas</span>
      </span>
    </Link>
  );
}
