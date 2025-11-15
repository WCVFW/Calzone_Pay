import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

// Define a type for the location state to avoid using 'any'
interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const location = useLocation() as { state: LocationState | null };
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submission starts
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await login(data.token);
      Swal.fire('Logged in', 'Successfully logged in', 'success').then(() => {
        // --- ROLE-BASED REDIRECTION ---
        const userRole = data.user.role;
        switch (userRole) {
          case 'ADMIN':
            navigate('/admin/dashboard'); // Or your admin route
            break;
          case 'EMPLOYEE':
            navigate('/employee/dashboard'); // Or your employee route
            break;
          default:
            // For regular users or if coming from a specific page
            navigate(location.state?.from?.pathname || '/');
        }
      });
    } catch (err) {
      console.error(err);
      // Improved error handling
      if (isAxiosError(err)) {
        if (err.response) {
          // The server responded with a status code (e.g., 401, 400)
          Swal.fire('Error', err.response.data.message || 'Login failed', 'error');
        } else {
          // A network error occurred (e.g., server is down)
          Swal.fire('Error', 'Cannot connect to the server. Please try again later.', 'error');
        }
      } else {
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
      }
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };

  return (
    <section className="signup__section bluar__shape py-5">
      <div className="container">
        <div className="row align-items-center justify-content-between">

          {/* ---------- Login Form Column ---------- */}
          <div className="col-xl-6 col-lg-6 mb-4 mb-lg-0">
            <div className="signup__boxes p-4 rounded shadow-sm bg-white">
              <h4 className="mb-3">Sign in to Rechargio</h4>
              <p className="head__pra mb-4">
                Sign in to your account and make recharges, payments, and bookings faster
              </p>

              <form onSubmit={submit} className="signup__form">
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

                  <div className="col-12">
                    <div className="input__grp">
                      <label htmlFor="password" className="form-label">
                        Enter Your Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        placeholder="Your Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control form-control-lg"
                      />
                    </div>
                  </div>

                  <div className="col-12 text-end">
                    <Link to="/forgot-password" className="forgot small text-decoration-none">
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="col-12 mt-3">
                    <button type="submit" className="cmn__btn w-100 py-2" disabled={loading}>
                      <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ---------- Image Column ---------- */}
          <div className="col-xl-5 col-lg-6 text-center">
            <div className="signup__thumb">
              <img
                src="/assets/img/signup/signup.png"
                alt="Login Illustration"
                className="img-fluid"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
} // <-- This closes the Login function
