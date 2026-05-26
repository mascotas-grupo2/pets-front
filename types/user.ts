export interface User {
  isLoggedIn: boolean;
  id?: number;
  name: string;
  email?: string;
  role: string;
  adopter: boolean;
  signature?: string;
}
