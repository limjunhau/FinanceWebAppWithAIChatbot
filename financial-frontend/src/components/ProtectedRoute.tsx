import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  // Check if the token is valid (not expired)
  const isTokenValid = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
    const expiry = payload.exp * 1000; // Expiry time in milliseconds

    // If the token has expired, return false
    if (expiry < Date.now()) {
      localStorage.removeItem('accessToken'); // Optionally clear the expired token
      return false;
    }
    return true;
  };

  return isAuthenticated && isTokenValid() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;