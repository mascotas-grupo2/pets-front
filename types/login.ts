export type LoginForm = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  adopter: boolean;
  role: string;
};
