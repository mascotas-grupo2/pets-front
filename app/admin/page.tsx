import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirección simple: si entran a /admin, van al dashboard
  redirect("/admin/dashboard");
}
