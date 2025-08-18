import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'lawyer' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated } = useAuth();

  console.log('🔒 ProtectedRoute: Checking access:', {
    isAuthenticated,
    user,
    requiredRole,
    userRole: user?.role,
    userType: user?.userType, // Check for legacy field
    localStorage: {
      currentUser: localStorage.getItem('currentUser'),
      token: localStorage.getItem('token') ? 'exists' : 'missing'
    }
  });

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // If role is required and user doesn't have the correct role
  if (requiredRole && user?.role !== requiredRole) {
    console.log('🔒 ProtectedRoute: Wrong role, redirecting');
    console.log('🔒 ProtectedRoute: Required role:', requiredRole);
    console.log('🔒 ProtectedRoute: User role:', user?.role);
    // Redirect based on user's actual role
    if (user?.role === 'lawyer') {
      return <Navigate to="/lawyer-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  console.log('🔒 ProtectedRoute: Access granted');
  return <>{children}</>;
}; 