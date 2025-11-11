import { Navigate, Outlet } from 'react-router-dom';
import { defaultRoutes } from '.';
import { useUserStore } from '../stores/user.store';

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const defaultRoute = defaultRoutes[user.role] || '/';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;