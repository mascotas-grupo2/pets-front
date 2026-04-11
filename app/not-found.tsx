import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="container notfound">
        <div className="code">404</div>
        <h2>Algo salió mal</h2>
        <p>La página que estás buscando no existe o fue movida.</p>
        <Link href="/" className="btn btn-primary btn-lg">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
