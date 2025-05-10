import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      const decodedToken = parseJwt(token); // Decode the JWT token using your parseJwt function
      const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';

      if (isAdmin) {
        // Redirect admin users to the admin dashboard
        navigate('/admin-dashboard');
      }
    } else {
      // If there's no token, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const navItems = [
    { label: 'Transaction', path: '/transaction' },
    { label: 'Budget', path: '/budget' },
    { label: 'Goal', path: '/goal' },
    { label: 'Report', path: '/report' },
    { label: 'Article', path: '/article' },
    { label: 'AI Bot', path: '/chatbot' }
  ];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
        <h4 className="mb-0">Dashboard</h4>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="container mt-5">
        <div className="row g-4 justify-content-center">
          {navItems.map((item, idx) => (
            <div className="col-md-4 col-sm-6" key={idx}>
              <div
                className="card shadow-sm h-100 text-center p-4 cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(item.path)}
              >
                <h5 className="card-title">{item.label}</h5>
                <p className="card-text">Go to {item.label.toLowerCase()} section</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Utility function to decode the JWT (your version)
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
};

export default DashboardPage;