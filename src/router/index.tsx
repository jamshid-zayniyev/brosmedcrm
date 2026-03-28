import { lazy, Suspense } from "react";
import { LoginPage } from "../components/LoginPage";
import Loading from "../components/loading";
import { RouteType } from "../interfaces/router.interface";

const loadPatientRegistration = () =>
  import("../components/reception/PatientRegistration");
const loadLabDashboard = () => import("../components/laboratory/LabDashboard");
const loadTestResults = () => import("../components/laboratory/TestResults");
const loadPatientAnalysis = () => import("../components/patient/patient-analysis");
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

const withPageSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

const labFlowRoles = ["s", "r", "l", "d", "c"];
const registrationRoles = ["s", "r", "l"];
const labResultsRoles = ["s", "l"];

export const publicRoutes: RouteType[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export const privateRoutes: (RouteType & { allowedRoles: string[] })[] = [
  {
    path: "/lab",
    element: withPageSuspense(<LabDashboard />),
    allowedRoles: labFlowRoles,
  },
  {
    path: "/lab/test-results",
    element: withPageSuspense(<TestResults />),
    allowedRoles: labResultsRoles,
  },
  {
    path: "/lab/patient-analysis/:id",
    element: withPageSuspense(<PatientAnalysis />),
    allowedRoles: labResultsRoles,
  },
  {
    path: "/reception/patient-registration",
    element: withPageSuspense(<PatientRegistration />),
    allowedRoles: registrationRoles,
  },
];

export const defaultRoutes: { [key: string]: string } = {
  s: "/lab",
  r: "/reception/patient-registration",
  l: "/lab",
  d: "/lab",
  c: "/lab",
};

/*
Legacy routes kept in source files intentionally, but excluded from the active
build to keep the laboratory bundle light:
- /superadmin
- /superadmin/user-management
- /superadmin/departments
- /superadmin/department-types
- /reception
- /reception/patient-queue
- /doctor
- /doctor/consultation
- /cashier
- /cashier/payment-processing
- /reports
- /settings
*/
