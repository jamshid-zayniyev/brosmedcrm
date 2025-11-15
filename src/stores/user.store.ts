import { create } from "zustand";
import { User, UserState } from "../interfaces/user.interface";

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));