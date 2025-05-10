import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthCheck } from '../utils/useAuthCheck';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Current logged-in user
  
  useAuthCheck();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const handleUserDetail = () => {
    if (currentUser) {
      navigate(`/user-detail/${currentUser.id}`); // Assuming user detail page exists
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me'); // API endpoint to get the current logged-in user
      setCurrentUser(response.data);
    } catch (err) {
      setError('Failed to fetch current user.');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-user/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);


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
        <h4 className="mb-0">Admin Dashboard</h4>
        <button className="btn btn-primary me-2" onClick={() => navigate('/user-dashboard')}>
          User Dashboard
        </button>
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
export default AdminDashboardPage;