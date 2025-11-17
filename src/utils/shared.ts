export const API_ENDPOINTS = {
  USER: {
    base: "/user/",
    login: "/user/login/",
    findMe: "/user/me/",
    refreshToken: "/user/auth/refresh/",
    users: "/user/users/",
  },
  DEPARTMENT: {
    base: "/department/department/",
  },
  DEPARTMENT_TYPE: {
    base: "/department/department_types/",
  },
  CLINIC_ABOUT: {
    base: "/utils/clinicabout/",
  },
  PATIENT: {
    base: "/reception/patient/",
    patientsForDoctor: "/reception/doctor/patients",
  },
  LAB: {
    base: "/laboratory/analysis/",
    stats: "/laboratory/analysis/stats/",
  },
  ANALYSIS_RESULT: {
    create: "/department/analysis_result/",
    update: (id: number) => `/department/analysis_result/${id}/`,
  },
  DOCTOR: {
    base: "/doctor/doctor/",
    consultations: "/doctor/consultations/",
    stats: "/doctor/consultations/stats/",
  },
  REPORT: {
    base: "/utils/report/",
  },
  CASHIER: {
    base: "/cashier/cashier/",
    stats: "/cashier/cashier/stats/",
  },
  RESULT: {
    findResultForDepartment: (id: number) =>
      `/laboratory/department/result/${id}/`,
  },
};

export const serverUrl =
  import.meta.env.VITE_API_URL || "https://brosmed.pythonanywhere.com";
