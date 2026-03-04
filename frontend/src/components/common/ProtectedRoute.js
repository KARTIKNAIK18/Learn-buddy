import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route so only authenticated users with the correct role can access it.
 * Unauthenticated users are sent to /login; wrong-role users to their own dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Roles are lowercase strings returned by backend: "teacher", "parents", "student"
    const dashMap = {
      teacher: '/teacher/dashboard',
      parents: '/parent/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashMap[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
