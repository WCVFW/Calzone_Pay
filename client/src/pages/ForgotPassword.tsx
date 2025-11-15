import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // eslint-disable-line

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for which view to show: 'request' or 'reset'
  const [view, setView] = useState<'request' | 'reset'>('request');
  
  // State for both forms
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      setView('reset');
    }
  }, [searchParams]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      Swal.fire('Check Your Email', response.data.message, 'success');
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to send reset code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      return;
    }
    if (!token) {
      Swal.fire('Error', 'Invalid session. Please request a new reset link.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
      });
      Swal.fire('Success', response.data.message, 'success');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup__section bluar__shape py-5">
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="signup__boxes p-4 p-md-5 rounded shadow-sm bg-white">
              {view === 'request' ? (
                <>
                  <h4 className="mb-3">Forgot Password</h4>
                  <p className="head__pra mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  <form onSubmit={handleRequestCode} className="signup__form">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="input__grp">
                          <label htmlFor="email" className="form-label">
                            Enter Your Email ID
                          </label>
                          <input
                            type="email"
                            id="email"
                            placeholder="Your email ID here"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control form-control-lg"
                          />
                        </div>
                      </div>
                      <div className="col-12 mt-4">
                        <button type="submit" className="cmn__btn w-100 py-2" disabled={loading}>
                          <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h4 className="mb-3">Reset Your Password</h4>
                  <p className="head__pra mb-4">Enter your new password below.</p>
                  <form onSubmit={handleResetPassword} className="signup__form">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="input__grp">
                          <label htmlFor="password">New Password</label>
                          <input
                            type="password"
                            id="password"
                            placeholder="Enter your new password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-control form-control-lg"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="input__grp">
                          <label htmlFor="confirmPassword">Confirm New Password</label>
                          <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm your new password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control form-control-lg"
                          />
                        </div>
                      </div>
                      <div className="col-12 mt-4">
                        <button type="submit" className="cmn__btn w-100 py-2" disabled={loading || !token}>
                          <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}