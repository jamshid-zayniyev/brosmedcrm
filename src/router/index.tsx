import { lazy, Suspense } from "react";
import { LoginPage } from "../components/LoginPage";
import Loading from "../components/loading";
import { RouteType } from "../interfaces/router.interface";

const loadSuperadminDashboard = () =>
  import("../components/superadmin/SuperadminDashboard");
const loadUserManagement = () => import("../components/superadmin/UserManagement");
const loadDepartmentPage = () => import("../components/superadmin/DepartmentPage");
const loadDepartmentTypePage = () =>
  import("../components/superadmin/DepartmentTypePage");
const loadReceptionDashboard = () =>
  import("../components/reception/ReceptionDashboard");
const loadPatientQueue = () => import("../components/reception/PatientQueue");
const loadPatientRegistration = () =>
  import("../components/reception/PatientRegistration");
const loadLabDashboard = () => import("../components/laboratory/LabDashboard");
const loadTestResults = () => import("../components/laboratory/TestResults");
const loadPatientAnalysis = () => import("../components/patient/patient-analysis");
const loadDoctorDashboard = () => import("../components/doctor/DoctorDashboard");
const loadPatientConsultation = () =>
  import("../components/doctor/PatientConsultation");
const loadCashierDashboard = () => import("../components/cashier/CashierDashboard");
const loadPaymentProcessing = () =>
  import("../components/cashier/PaymentProcessing");
const loadReportsPage = () => import("../components/ReportsPage");
const loadSettingsPage = () => import("../components/SettingsPage");

const privateRoutePreloaders = [
  loadSuperadminDashboard,
  loadUserManagement,
  loadDepartmentPage,
  loadDepartmentTypePage,
  loadReceptionDashboard,
  loadPatientQueue,
  loadPatientRegistration,
  loadLabDashboard,
  loadTestResults,
  loadPatientAnalysis,
  loadDoctorDashboard,
  loadPatientConsultation,
  loadCashierDashboard,
  loadPaymentProcessing,
  loadReportsPage,
  loadSettingsPage,
];

export const preloadPrivateRouteModules = () => {
  privateRoutePreloaders.forEach((preload) => {
    void preload();
  });
};

const SuperadminDashboard = lazy(() =>
  loadSuperadminDashboard().then((module) => ({
    default: module.SuperadminDashboard,
  })),
);
const UserManagement = lazy(() =>
  loadUserManagement().then((module) => ({
    default: module.UserManagement,
  })),
);
const DepartmentPage = lazy(() =>
  loadDepartmentPage().then((module) => ({
    default: module.DepartmentPage,
  })),
);
const DepartmentTypePage = lazy(() =>
  loadDepartmentTypePage().then((module) => ({
    default: module.DepartmentTypePage,
  })),
);
const ReceptionDashboard = lazy(() =>
  loadReceptionDashboard().then((module) => ({
    default: module.ReceptionDashboard,
  })),
);
const PatientQueue = lazy(() =>
  loadPatientQueue().then((module) => ({
    default: module.PatientQueue,
  })),
);
const PatientRegistration = lazy(() =>
  loadPatientRegistration().then((module) => ({
    default: module.PatientRegistration,
  })),
);
const LabDashboard = lazy(() =>
  loadLabDashboard().then((module) => ({
    default: module.LabDashboard,
  })),
);
const TestResults = lazy(() =>
  loadTestResults().then((module) => ({
    default: module.TestResults,
  })),
);
const PatientAnalysis = lazy(() => loadPatientAnalysis());
const DoctorDashboard = lazy(() =>
  loadDoctorDashboard().then((module) => ({
    default: module.DoctorDashboard,
  })),
);
const PatientConsultation = lazy(() =>
  loadPatientConsultation().then((module) => ({
    default: module.PatientConsultation,
  })),
);
const CashierDashboard = lazy(() =>
  loadCashierDashboard().then((module) => ({
    default: module.CashierDashboard,
  })),
);
const PaymentProcessing = lazy(() =>
  loadPaymentProcessing().then((module) => ({
    default: module.PaymentProcessing,
  })),
);
const ReportsPageLazy = lazy(() =>
  loadReportsPage().then((module) => ({
    default: module.ReportsPage,
  })),
);
const SettingsPageLazy = lazy(() =>
  loadSettingsPage().then((module) => ({
    default: module.SettingsPage,
  })),
);

const withPageSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

export const publicRoutes: RouteType[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export const privateRoutes: (RouteType & { allowedRoles: string[] })[] = [
  {
    path: "/superadmin",
    element: withPageSuspense(<SuperadminDashboard />),
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/user-management",
    element: withPageSuspense(<UserManagement />),
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/departments",
    element: withPageSuspense(<DepartmentPage />),
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/department-types",
    element: withPageSuspense(<DepartmentTypePage />),
    allowedRoles: ["s"],
  },
  {
    path: "/reception",
    element: withPageSuspense(<ReceptionDashboard />),
    allowedRoles: ["r"],
  },
  {
    path: "/reception/patient-queue",
    element: withPageSuspense(<PatientQueue />),
    allowedRoles: ["r"],
  },
  {
    path: "/lab",
    element: withPageSuspense(<LabDashboard />),
    allowedRoles: ["l"],
  },
  {
    path: "/lab/test-results",
    element: withPageSuspense(<TestResults />),
    allowedRoles: ["l"],
  },
  {
    path: "/lab/patient-analysis/:id",
    element: withPageSuspense(<PatientAnalysis />),
    allowedRoles: ["l", "s"],
  },
  {
    path: "/reception/patient-registration",
    element: withPageSuspense(<PatientRegistration />),
    allowedRoles: ["r", "l"],
  },
  {
    path: "/doctor",
    element: withPageSuspense(<DoctorDashboard />),
    allowedRoles: ["d"],
  },
  {
    path: "/doctor/consultation",
    element: withPageSuspense(<PatientConsultation />),
    allowedRoles: ["d"],
  },
  {
    path: "/cashier",
    element: withPageSuspense(<CashierDashboard />),
    allowedRoles: ["c"],
  },
  {
    path: "/cashier/payment-processing",
    element: withPageSuspense(<PaymentProcessing />),
    allowedRoles: ["c"],
  },
  {
    path: "/reports",
    element: withPageSuspense(<ReportsPageLazy />),
    allowedRoles: ["s", "r"],
  },
  {
    path: "/settings",
    element: withPageSuspense(<SettingsPageLazy />),
    allowedRoles: ["s"],
  },
];

export const defaultRoutes: { [key: string]: string } = {
  s: "/superadmin",
  r: "/reception",
  l: "/lab",
  d: "/doctor",
  c: "/cashier",
};
