export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  adopter: boolean;
}

export interface UserState {
  userId: string | number;
  name: string;
  adopter: boolean;
  role: string;
}