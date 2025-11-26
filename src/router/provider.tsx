import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { publicRoutes, privateRoutes, defaultRoutes } from ".";
import { useUserStore } from "../stores/user.store";
import { handleStorage } from "../utils/handle-storage";
import { authService } from "../services/auth.service";
import { Layout } from "../components/Layout";
import PrivateRoute from "./private-route";
import Loading from "../components/loading";

const AppProvider = () => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = handleStorage({ key: "access_token" });
    if (token) {
      const fetchUser = async () => {
        try {
          const user = await authService.findMe();
          setUser(user);
        } catch (error) {
          handleStorage({ key: "access_token", value: null });
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [setUser]);

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        {user ? (
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            {privateRoutes.map((route) => (
              <Route
                key={route.path}
                element={<PrivateRoute allowedRoles={route.allowedRoles} />}
              >
                <Route path={route.path} element={route.element} />
              </Route>
            ))}
          </Route>
        ) : null}
        <Route
          path="*"
          element={
            <Navigate to={user ? defaultRoutes[user.role] || "/" : "/login"} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppProvider;
