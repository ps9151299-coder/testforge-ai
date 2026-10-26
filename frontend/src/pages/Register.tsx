// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the terms to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // Connect to real FastAPI backend user registration
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      // Store authentic JWT Bearer token & profile, then auto-login to Dashboard
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('current_user', data.user.email);
      localStorage.setItem('user_name', data.user.name);

      alert(`Account created successfully! Welcome to TestForge AI, ${data.user.name}.`);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Unable to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="auth-card">
        
        {/* Left Side: 3D Brown Spheres & Branding */}
        <div className="hero-section">
          <div className="bubble-shape bubble-bg-curve" />
          <div className="bubble-shape bubble-large" />
          <div className="bubble-shape bubble-small" />

          <div className="hero-content">
            <h1 className="hero-welcome">WELCOME</h1>
            <h2 className="hero-headline">Create Your Workspace</h2>
            <p className="hero-description">
              Join TestForge AI to generate automated test strategies, scenarios, and scripts directly from requirements.
            </p>
          </div>
        </div>

        {/* Right Side: Cream Registration Form */}
        <div className="form-section">
          <div className="bubble-corner" />

          <div className="form-header">
            <h2 className="form-title">Sign up</h2>
            <p className="form-subtitle">Fill in your details to create an account.</p>
          </div>

          <form className="form-body" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input
                type="text"
                required
                className="form-field"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div className="input-container">
              <span className="input-icon">✉</span>
              <input
                type="email"
                required
                className="form-field"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-show"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Terms checkbox */}
            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                I agree to the Terms & Privacy
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-signin" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => alert('SSO sign-up coming soon')}
            >
              Sign up with other
            </button>

            <p className="form-footer">
              Already have an account?{' '}
              <Link to="/login" className="signup-link">
                Sign In
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;