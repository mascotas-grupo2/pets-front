export interface User {
  isLoggedIn: boolean;
  id?: number;
  name: string;
  email?: string;
  role: string;
  adopter: boolean;
  signature?: string;
  // Refugio (tenant) al que pertenece un admin. null/undefined para usuarios
  // comunes y para el superadmin (que no está atado a un solo refugio).
  refugioId?: number | null;
}
