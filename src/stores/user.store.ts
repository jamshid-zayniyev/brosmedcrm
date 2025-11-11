import { create } from "zustand";

interface User {
  id: number;
  department: number;
  full_name: string;
  username: string;
  phone_number: string;
  role: "s" | "r" | "l" | "d" | "c";
  is_active: boolean;
}

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));