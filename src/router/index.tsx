import { DoctorDashboard } from "../components/doctor/DoctorDashboard";
import { LabDashboard } from "../components/laboratory/LabDashboard";
import { LoginPage } from "../components/LoginPage";
import { ReportsPage } from "../components/ReportsPage";
import { ReceptionDashboard } from "../components/reception/ReceptionDashboard";
import { SettingsPage } from "../components/SettingsPage";
import { DepartmentPage } from "../components/superadmin/DepartmentPage";
import { DepartmentTypePage } from "../components/superadmin/DepartmentTypePage";
import { SuperadminDashboard } from "../components/superadmin/SuperadminDashboard";
import { UserManagement } from "../components/superadmin/UserManagement";
import { RouteType } from "./types";

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
    path: "/lab",
    element: <LabDashboard />,
    allowedRoles: ["l"],
  },
  {
    path: "/doctor",
    element: <DoctorDashboard />,
    allowedRoles: ["d"],
  },
];

export const defaultRoutes: { [key: string]: string } = {
  s: "/superadmin",
  r: "/reception",
  l: "/lab",
  d: "/doctor",
  c: "/cashier",
};
