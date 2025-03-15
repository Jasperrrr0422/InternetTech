import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const Layout = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // 重定向到对应角色的默认页面
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'owner':
        return <Navigate to="/owner" replace />;
      case 'user':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}; 