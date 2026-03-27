import { create } from "zustand";
import { departmentService } from "../services/department.service";
import { departmentTypeService } from "../services/department-type.service";

interface ReferenceDataStore {
  departments: any[];
  departmentTypes: any[];
  departmentsLoaded: boolean;
  departmentTypesLoaded: boolean;
  departmentsPromise: Promise<any[]> | null;
  departmentTypesPromise: Promise<any[]> | null;
  setDepartments: (departments: any[]) => void;
  setDepartmentTypes: (departmentTypes: any[]) => void;
  fetchDepartments: (force?: boolean) => Promise<any[]>;
  fetchDepartmentTypes: (force?: boolean) => Promise<any[]>;
  clearDepartments: () => void;
  clearDepartmentTypes: () => void;
}

export const useReferenceDataStore = create<ReferenceDataStore>((set, get) => ({
  departments: [],
  departmentTypes: [],
  departmentsLoaded: false,
  departmentTypesLoaded: false,
  departmentsPromise: null,
  departmentTypesPromise: null,
  setDepartments: (departments) =>
    set({
      departments,
      departmentsLoaded: true,
    }),
  setDepartmentTypes: (departmentTypes) =>
    set({
      departmentTypes,
      departmentTypesLoaded: true,
    }),
  fetchDepartments: async (force = false) => {
    const state = get();

    if (!force && state.departmentsLoaded) {
      return state.departments;
    }

    if (!force && state.departmentsPromise) {
      return state.departmentsPromise;
    }

    const request = departmentService
      .findAll()
      .then((data) => {
        const normalized = data?.results || data || [];

        set({
          departments: normalized,
          departmentsLoaded: true,
          departmentsPromise: null,
        });

        return normalized;
      })
      .catch((error) => {
        set({
          departmentsPromise: null,
        });

        throw error;
      });

    set({
      departmentsPromise: request,
    });

    return request;
  },
  fetchDepartmentTypes: async (force = false) => {
    const state = get();

    if (!force && state.departmentTypesLoaded) {
      return state.departmentTypes;
    }

    if (!force && state.departmentTypesPromise) {
      return state.departmentTypesPromise;
    }

    const request = departmentTypeService
      .findAll()
      .then((data) => {
        const normalized = data?.results || data || [];

        set({
          departmentTypes: normalized,
          departmentTypesLoaded: true,
          departmentTypesPromise: null,
        });

        return normalized;
      })
      .catch((error) => {
        set({
          departmentTypesPromise: null,
        });

        throw error;
      });

    set({
      departmentTypesPromise: request,
    });

    return request;
  },
  clearDepartments: () =>
    set({
      departments: [],
      departmentsLoaded: false,
      departmentsPromise: null,
    }),
  clearDepartmentTypes: () =>
    set({
      departmentTypes: [],
      departmentTypesLoaded: false,
      departmentTypesPromise: null,
    }),
}));
