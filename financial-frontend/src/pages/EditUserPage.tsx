import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  const isTokenExpired = (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expiration = decodedToken?.exp;
      return expiration ? Date.now() >= expiration * 1000 : true;
    } catch {
      return true;
    }
  };

  const handleBackToDashboard = () => {
    if (isTokenExpired()) {
      navigate('/login');
    } else {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decodedToken = parseJwt(token);
        const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';
        navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, allUsersResponse] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get('/admin/users'),
        ]);

        console.log('All users response:', allUsersResponse.data); // <== Add this

        setUser(userResponse.data);

        // Ensure allUsers is always an array
        const usersArray = Array.isArray(allUsersResponse.data)
          ? allUsersResponse.data
          : allUsersResponse.data.users || []; // handle if data is { users: [...] }

        setAllUsers(usersArray);
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    fetchData();
  }, [id]);

  const validateEmail = (email: string): boolean => {
    // Make sure it's a valid email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }

    // Check if the email already exists in other users (excluding the current user)
    const isDuplicate = allUsers.some(
      (u) => u.email === email
    );

    if (isDuplicate) {
      setEmailError('Email already exists');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'email') {
      validateEmail(value); // Validate email change immediately
    }

    setUser((prevUser: any) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validate email before saving
    const isEmailValid = validateEmail(user.email);
    if (!isEmailValid) return; // Prevent save if email is invalid

    setIsSaving(true);
    try {
      await api.put(`/admin/users/${id}`, {
        fullName: user.fullName,
        email: user.email,
        userName: user.userName,
      });
      alert('User updated successfully!');
      navigate('/admin-dashboard');
    } catch (err) {
      alert('Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <button className="btn btn-primary mb-3" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>

      <h3>Edit User</h3>

      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-control"
          name="fullName"
          value={user.fullName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${emailError ? 'is-invalid' : ''}`}
          name="email"
          value={user.email}
          onChange={handleInputChange}
          onBlur={() => validateEmail(user.email)} // Optional: check on blur
        />
        {emailError && <div className="invalid-feedback">{emailError}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Username</label>
        <input
          type="text"
          className="form-control"
          name="userName"
          value={user.userName}
          onChange={handleInputChange}
        />
      </div>

      <button
        className="btn btn-success me-2"
        onClick={handleSave}
        disabled={isSaving || !!emailError} // Disable save if email error exists
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Cancel
      </button>
    </div>
  );
}

export default EditUserPage;