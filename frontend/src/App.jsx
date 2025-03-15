import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 创建路由保护组件
const ProtectedRoute = ({ element, allowedRoles }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('access_token');

  // 如果没有token，重定向到登录页
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 如果角色不在允许列表中，重定向到对应的默认页面
  if (!allowedRoles.includes(role)) {
    switch (role) {
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

  // 如果验证通过，渲染组件
  return element;
};

function App() {
  // 用于跟踪认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 用户路由 */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute 
              element={<HomePage />} 
              allowedRoles={['user', 'owner', 'admin']} 
            />
          } 
        />
        <Route 
          path="/user/*" 
          element={
            <ProtectedRoute 
              element={<UserPage />} 
              allowedRoles={['user']} 
            />
          } 
        />

        {/* 房主路由 */}
        <Route 
          path="/owner/*" 
          element={
            <ProtectedRoute 
              element={<OwnerPage />} 
              allowedRoles={['owner']} 
            />
          } 
        />

        {/* 管理员路由 */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute 
              element={<AdminPage />} 
              allowedRoles={['admin']} 
            />
          } 
        />

        {/* 404 页面 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 