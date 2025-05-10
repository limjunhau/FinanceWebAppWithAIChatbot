import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

function UserDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  // Fetch users on component mount
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const rawData = response.data;
  
      // Extract the $values array from the response
      const formattedUsers = rawData?.$values?.map((user: any) => ({
        id: user.id,
        username: user.userName,
        fullName: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
      })) || [];
  
      setUsers(formattedUsers);
    } catch (err) {
      setError('Failed to fetch users.');
    }
  };
  
  const isTokenExpired = (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expiration = decodedToken?.exp;

    if (expiration) {
      return Date.now() >= expiration * 1000;
    }
    return true;
  };

  // Handle the Back to Dashboard button click
  const handleBackToDashboard = () => {
    // Check if the token is expired first
    if (isTokenExpired()) {
      console.log('Token is expired, redirecting to login.');
      navigate('/login');
    } else {
      const token = localStorage.getItem('accessToken');
  
      if (token) {
        // Decode the JWT token (access token)
        const decodedToken = parseJwt(token); // Assuming parseJwt is a utility that decodes JWT tokens
        console.log('Decoded Token:', decodedToken); // Debugging log
  
        // Check if decoded token has an 'IsAdmin' claim
        const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';
  
        if (isAdmin) {
          console.log('Admin detected, redirecting to admin-dashboard.');
          navigate('/admin-dashboard');
        } else {
          console.log('Regular user detected, redirecting to dashboard.');
          navigate('/dashboard');
        }
      } else {
        console.log('No access token found, redirecting to login.');
        navigate('/login');
      }
    }
  };
  // Handle user edit
  const handleEdit = (id: string) => {
    navigate(`/edit-user/${id}`);
  };

  // Handle user delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || isTokenExpired()) {
      console.log('No token or token expired, redirecting to login.');
      navigate('/login');
      return;
    }
  
    const decodedToken = parseJwt(token);
    const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';
  
    if (!isAdmin) {
      console.log('Not an admin, redirecting to regular dashboard.');
      navigate('/dashboard');
      return;
    }
  
    fetchUsers();
  }, []);

  return (
    <div className="container mt-5">
              <button
        className="btn btn-primary mb-3"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>
      <h3 className="mb-4">User Dashboard</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(user.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDashboardPage;