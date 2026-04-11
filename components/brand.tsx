import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Furry Friends">
      <span className="brand-mark" aria-hidden>
        🐾
      </span>
      <span className="brand-name">
        <span className="row1">Furry</span>
        <span className="row2">Friends</span>
      </span>
    </Link>
  );
}
