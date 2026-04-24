import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const ROLE_CONFIG = {
  student: {
    icon: '🎓', label: 'Student Login', color: '#C8102E',
    hint: 'Format: name_departmentyear@its.edu.in',
    example: 'e.g. rahul_cse2022@its.edu.in'
  },
  faculty: {
    icon: '👨‍🏫', label: 'Faculty Login', color: '#C8102E',
    hint: 'Format: name.department@its.edu.in',
    example: 'e.g. priya.aiml@its.edu.in'
  },
  admin: {
    icon: '🛡️', label: 'Admin Login', color: '#C8102E',
    hint: 'Format: name.department@its.edu.in',
    example: 'e.g. ashish.cse@its.edu.in'
  }
};

export default function LoginPage({ role, onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'CSE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await axios.post('/api/auth/signup', { ...form });
        if (res.data.success) {
          setMode('login');
          setError('');
          alert('Account created! Please login.');
        }
      } else {
        const res = await axios.post('/api/auth/login', { email: form.email, password: form.password, requestedRole: role });
        if (res.data.success) onLogin(res.data.user);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="lb-shape s1" /><div className="lb-shape s2" />
      </div>
      <div className="login-card animate-in">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="login-header">
          <div className="login-icon">{cfg.icon}</div>
          <h1>{cfg.label}</h1>
          <p className="login-hint">{cfg.hint}</p>
          <p className="login-example">{cfg.example}</p>
        </div>

        <div className="login-tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>Login</button>
          {(
            <button className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')}>Signup</button>
          )}
        </div>

        <div className="login-form">
          {mode === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <input className="input-field" placeholder="Your full name" value={form.name} onChange={update('name')} />
            </div>
          )}
          <div className="input-group">
            <label>College Email</label>
            <input className="input-field" type="email" placeholder="yourname@its.edu.in" value={form.email} onChange={update('email')} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} />
          </div>
          {mode === 'signup' && (
            <div className="input-group">
              <label>Department</label>
              <select className="input-field" value={form.department} onChange={update('department')}>
                <option>CSE</option><option>AIML</option><option>DS</option><option>ECE</option>
              </select>
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Login →' : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
