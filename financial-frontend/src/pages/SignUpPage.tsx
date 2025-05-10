import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={met ? 'text-success' : 'text-danger'}>
      <i className={`me-2 ${met ? 'fas fa-check' : 'fas fa-times'}`}></i>
      {text}
    </li>
  );
}

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    const minLength = 6;

    if (password.length < minLength) {
      errors.push(`Passwords must be at least ${minLength} characters.`);
    }
    if (!/[^\w\s]/.test(password)) {
      errors.push('Passwords must have at least one non-alphanumeric character.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Passwords must have at least one lowercase character.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwords must have at least one uppercase character.');
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors);
      return;
    } else {
      setPasswordErrors([]);
    }

    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        fullName,
      });

      if (response.status === 200) {
        setSuccessMessage('Successfully registered! Redirecting to login...');
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.log('Error response:', err?.response);

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data);

      if (
        err?.response?.status === 409 ||
        serverMessage?.toLowerCase().includes('email')
      ) {
        setError('Email already registered.');
      } else {
        setError('Email already registered.');
      }

      setSuccessMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <button className="btn btn-link" onClick={() => navigate('/')}>
        <i className="fas fa-arrow-left"></i>
      </button>

      <h2>Sign Up</h2>

      {/* Success message */}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Error message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Password validation errors on submit */}
      {passwordErrors.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0">
            {passwordErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input
            type="text"
            id="fullName"
            className="form-control"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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
          <ul className="mt-2 list-unstyled">
            <PasswordRequirement
              met={password.length >= 6}
              text="At least 6 characters"
            />
            <PasswordRequirement
              met={/[^\w\s]/.test(password)}
              text="At least one non-alphanumeric character"
            />
            <PasswordRequirement
              met={/[a-z]/.test(password)}
              text="At least one lowercase letter"
            />
            <PasswordRequirement
              met={/[A-Z]/.test(password)}
              text="At least one uppercase letter"
            />
          </ul>
        </div>

        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpPage;