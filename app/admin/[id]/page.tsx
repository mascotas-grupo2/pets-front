"use client";

import { useParams, useRouter } from "next/navigation";
import { SECTION_MAP, type Section } from "@/components/admin/admin-config";
import { SECTION_CONTENT } from "@/components/admin/sections/registry";
import { PlaceholderSection } from "@/components/admin/sections/placeholder-section";
import type { SectionProps } from "@/components/admin/admin-config";

export default function AdminSectionPage() {
  const params = useParams();
  const router = useRouter();
  const activeSection = params.id as Section;
  const SectionComponent = SECTION_CONTENT[activeSection];
  const meta = SECTION_MAP[activeSection];

  const handleNavigate: SectionProps["onNavigate"] = (section) => {
    router.push(`/admin/${section}`);
  };

  if (!SectionComponent) {
    return <PlaceholderSection title={meta?.title ?? "Sección no encontrada"} />;
  }

  return <SectionComponent onNavigate={handleNavigate} />;
}
