import { CashierDashboard } from "../components/cashier/CashierDashboard";
import { PaymentProcessing } from "../components/cashier/PaymentProcessing";
import { DoctorDashboard } from "../components/doctor/DoctorDashboard";
import { PatientConsultation } from "../components/doctor/PatientConsultation";
import { LabDashboard } from "../components/laboratory/LabDashboard";
import { TestResults } from "../components/laboratory/TestResults";
import { LoginPage } from "../components/LoginPage";
import { ReportsPage } from "../components/ReportsPage";
import { PatientQueue } from "../components/reception/PatientQueue";
import { PatientRegistration } from "../components/reception/PatientRegistration";
import { ReceptionDashboard } from "../components/reception/ReceptionDashboard";
import { SettingsPage } from "../components/SettingsPage";
import { DepartmentPage } from "../components/superadmin/DepartmentPage";
import { DepartmentTypePage } from "../components/superadmin/DepartmentTypePage";
import { SuperadminDashboard } from "../components/superadmin/SuperadminDashboard";
import { UserManagement } from "../components/superadmin/UserManagement";
import { RouteType } from "../interfaces/router.interface";

export const publicRoutes: RouteType[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export const privateRoutes: (RouteType & { allowedRoles: string[] })[] = [
  {
    path: "/superadmin",
    element: <SuperadminDashboard />,
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/user-management",
    element: <UserManagement />,
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/departments",
    element: <DepartmentPage />,
    allowedRoles: ["s"],
  },
  {
    path: "/superadmin/department-types",
    element: <DepartmentTypePage />,
    allowedRoles: ["s"],
  },
  {
    path: "/reports",
    element: <ReportsPage />,
    allowedRoles: ["s", "r"],
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    allowedRoles: ["s"],
  },
  {
    path: "/reception",
    element: <ReceptionDashboard />,
    allowedRoles: ["r"],
  },
  {
    path: "/reception/patient-queue",
    element: <PatientQueue />,
    allowedRoles: ["r"],
  },
  {
    path: "/reception/patient-registration",
    element: <PatientRegistration />,
    allowedRoles: ["r"],
  },
  {
    path: "/lab",
    element: <LabDashboard />,
    allowedRoles: ["l"],
  },
  {
    path: "/lab/test-results",
    element: <TestResults />,
    allowedRoles: ["l"],
  },
  {
    path: "/doctor",
    element: <DoctorDashboard />,
    allowedRoles: ["d"],
  },
  {
    path: "/doctor/consultation",
    element: <PatientConsultation />,
    allowedRoles: ["d"],
  },
  {
    path: "/cashier",
    element: <CashierDashboard />,
    allowedRoles: ["c"],
  },
  {
    path: "/cashier/payment-processing",
    element: <PaymentProcessing />,
    allowedRoles: ["c"],
  },
];

export const defaultRoutes: { [key: string]: string } = {
  s: "/superadmin",
  r: "/reception",
  l: "/lab",
  d: "/doctor",
  c: "/cashier",
};

