import { PawPrint } from "lucide-react";

type ThumbPet = { photos?: string[] | null; photo?: string | null };

/** Avatar cuadrado de una mascota: primera foto disponible o ícono de fallback. */
export function PetThumb({ pet, size = 16 }: { pet: ThumbPet; size?: number }) {
  const src = pet.photos?.[0] ?? pet.photo ?? null;
  return (
    <span className="val-thumb" aria-hidden>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        <PawPrint size={size} />
      )}
    </span>
  );
}
