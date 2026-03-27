import { useEffect, useState } from "react";
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
  preloadPrivateRouteModules,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const token = handleStorage({ key: "access_token" });

    if (token) {
      const fetchUser = async () => {
        try {
          const currentUser = await authService.findMe();
          if (isMounted) {
            setUser(currentUser);
          }
        } catch (error) {
          handleStorage({ key: "access_token", value: null });
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => {
        preloadPrivateRouteModules();
      });

      return () => {
        idleWindow.cancelIdleCallback?.(handle);
      };
    }

    const timeoutId = window.setTimeout(() => {
      preloadPrivateRouteModules();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user]);

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
