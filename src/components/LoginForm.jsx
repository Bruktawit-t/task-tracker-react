import React, { useState } from 'react';
import './AuthForm.css';
import { loginUser } from '../api'; // make sure this import path matches your structure

const LoginForm = ({ onLoginSuccess, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginUser({ email, password });

      // ✅ Save token to localStorage for future authenticated requests
      localStorage.setItem('token', result.token);

      // ✅ Notify parent component (App.jsx) that login succeeded
      onLoginSuccess();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
        <p>
          Don't have an account?{' '}
          <span onClick={switchToRegister} className="auth-link">Register</span>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
