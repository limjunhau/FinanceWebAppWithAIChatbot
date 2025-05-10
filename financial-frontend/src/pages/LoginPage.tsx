import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);

        const claims = parseJwt(token);
        const isAdmin = claims?.IsAdmin?.toString().toLowerCase() === 'true';

        if (isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <button className="btn btn-link" onClick={() => navigate('/')}>
        <i className="fas fa-arrow-left"></i>
      </button>
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Login</button>
      </form>

      <div className="mt-3">
        <button className="btn btn-link" onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

export default LoginPage;