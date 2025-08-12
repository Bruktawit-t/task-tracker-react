import React, { useState } from 'react';
import { login } from '../api';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password });
      // Assuming data = { token: '...' }
      localStorage.setItem('token', data.token);
      onLogin(); // Notify parent that login succeeded
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="input"
      />
      <button type="submit" className="btn">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
