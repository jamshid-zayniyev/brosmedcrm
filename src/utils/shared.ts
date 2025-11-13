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
  },
  LAB: {
    base: "/laboratory/analysis/",
  },
  DOCTOR: {
    base: "/doctor/doctor/",
    consultations: "/doctor/consultations",
  },
};

export const serverUrl =
  import.meta.env.VITE_API_URL || "https://brosmed.pythonanywhere.com";
