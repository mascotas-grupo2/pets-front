"use client";

import { useParams, useRouter } from "next/navigation";
import { SolicitudDetailView } from "@/components/admin/sections/solicitudes/solicitud-detail-view";

export default function SolicitudDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <SolicitudDetailView 
      id={id} 
      onBack={() => router.push("/admin/solicitudes")} 
    />
  );
}
