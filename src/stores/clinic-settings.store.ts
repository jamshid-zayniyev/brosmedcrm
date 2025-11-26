import { create } from "zustand";

export interface IClinicSettings {
  name: string;
  address: string;
  phone_number: string;
  email: string;
  work_time: string;
}

interface ClinicSettingsStore {
  clinicSettings: IClinicSettings | null;
  setClinicSettings: (data: IClinicSettings) => void;
}

export const useClinicSettings = create<ClinicSettingsStore>((set) => ({
  clinicSettings: null,
  setClinicSettings: (data: IClinicSettings) =>
    set({
      clinicSettings: data,
    }),
}));
