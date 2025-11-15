import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    referralCode: '',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the payload to match the backend's expectations
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      await api.post('/auth/register', payload);
      // Automatically log in the user after successful signup
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      await login(data.token);
      Swal.fire('Success!', 'Account created successfully. Please complete your KYC.', 'success');
      navigate('/kyc');
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', err?.response?.data?.message || 'Signup failed', 'error');
    }
  };

  return (
    <section className="signup__section bluar__shape py-5">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          {/* ---------- Form Column ---------- */}
          <div className="col-xl-6 col-lg-6 mb-4 mb-lg-0">
            <div className="signup__boxes p-4 rounded shadow-sm bg-white">
              <h4>Let's Get Started!</h4>
              <p className="head__pra">
                Please Enter your Email Address to Start your Online Application
              </p>

              <form onSubmit={submit} className="signup__form pt-4">
                <div className="row g-3">
                  <div className="col-lg-6">
                    <div className="input__grp">
                      <label htmlFor="fname">First Name</label>
                      <input
                        type="text"
                        id="fname"
                        placeholder="John"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input__grp">
                      <label htmlFor="lname">Last Name</label>
                      <input
                        type="text"
                        id="lname"
                        placeholder="Fisher"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input__grp">
                      <label htmlFor="email">Enter Your Email ID</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="Your email ID here"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input__grp">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="Your phone number"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="input__grp">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        placeholder="Create a password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="input__grp">
                      <label htmlFor="code">Referral Code</label>
                      <input
                        type="text"
                        id="code"
                        placeholder="Enter the referral code"
                        value={form.referralCode}
                        onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <p className="tag__pra small text-muted">
                      By clicking submit, you agree to{' '}
                      <a href="#">Terms of Use</a>,{' '}
                      <a href="#">Privacy Policy</a>,{' '}
                      <a href="#">E-sign</a> &{' '}
                      <a href="#">communication Authorization</a>.
                    </p>
                  </div>
                  <div className="col-lg-12">
                    <button type="submit" className="cmn__btn w-100 mt-2">
                      <span>Signup</span>
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
                alt="Signup Illustration"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
