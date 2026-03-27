import { create } from "zustand";

export interface IClinicSettings {
  name: string;
  address: string;
  phone_number: string;
  email: string;
  work_time: string;
}

interface ClinicSettingsStore {
  clinicSettingsId: number | null;
  clinicSettings: IClinicSettings | null;
  hasLoaded: boolean;
  setClinicSettings: (data: IClinicSettings, id?: number | null) => void;
  resetClinicSettings: () => void;
}

export const useClinicSettings = create<ClinicSettingsStore>((set) => ({
  clinicSettingsId: null,
  clinicSettings: null,
  hasLoaded: false,
  setClinicSettings: (data: IClinicSettings, id = null) =>
    set({
      clinicSettingsId: id,
      clinicSettings: data,
      hasLoaded: true,
    }),
  resetClinicSettings: () =>
    set({
      clinicSettingsId: null,
      clinicSettings: null,
      hasLoaded: false,
    }),
}));
