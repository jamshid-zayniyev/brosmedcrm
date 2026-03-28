import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  publicRoutes,
  privateRoutes,
  defaultRoutes,
} from ".";
import { useUserStore } from "../stores/user.store";
import { handleStorage } from "../utils/handle-storage";
import { authService } from "../services/auth.service";
import { Layout } from "../components/Layout";
import PrivateRoute from "./private-route";
import Loading from "../components/loading";

const AppProvider = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const token = useUserStore((state) => state.token);
  const storedToken = handleStorage({ key: "access_token" }) as string | null;
  const accessToken = token ?? storedToken;
  const currentUserQuery = useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: authService.findMe,
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (token !== accessToken) {
      setToken(accessToken ?? null);
    }

    if (!accessToken) {
      setUser(null);
    }
  }, [accessToken, setToken, setUser, token]);

  useEffect(() => {
    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data, setUser]);

  useEffect(() => {
    if (!currentUserQuery.isError) {
      return;
    }

    handleStorage({ key: "access_token", value: null });
    setToken(null);
    setUser(null);
  }, [currentUserQuery.isError, setToken, setUser]);

  if (accessToken && currentUserQuery.isPending && !user) {
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
