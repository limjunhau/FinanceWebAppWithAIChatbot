import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <li className={met ? 'text-success' : 'text-danger'}>
    <i className={`me-2 ${met ? 'fas fa-check' : 'fas fa-times'}`}></i>
    {text}
  </li>
);

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('OTP sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Email not Registered');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('OTP verified. You can now reset your password.');
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.[0]?.description ||
        err?.response?.data?.message ||
        'Failed to reset password. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <button className="btn btn-link" onClick={() => navigate('/login')}>
        <i className="fas fa-arrow-left"></i> Back to Login
      </button>

      <div className="card mx-auto mt-3" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <h3 className="card-title mb-4 text-center">Forgot Password</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Send OTP</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3">
                <label htmlFor="otp" className="form-label">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-control"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <ul className="mt-2 list-unstyled">
                  <PasswordRequirement
                    met={newPassword.length >= 6}
                    text="At least 6 characters"
                  />
                  <PasswordRequirement
                    met={/[^\w\s]/.test(newPassword)}
                    text="At least one non-alphanumeric character"
                  />
                  <PasswordRequirement
                    met={/[a-z]/.test(newPassword)}
                    text="At least one lowercase letter"
                  />
                  <PasswordRequirement
                    met={/[A-Z]/.test(newPassword)}
                    text="At least one uppercase letter"
                  />
                </ul>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">Reset Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;