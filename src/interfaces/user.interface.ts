export interface User {
  id: number;
  department: number;
  full_name: string;
  username: string;
  phone_number: string;
  role: "s" | "r" | "l" | "d" | "c";
  is_active: boolean;
}

export interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}
