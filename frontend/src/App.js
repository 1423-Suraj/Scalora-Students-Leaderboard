import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentPanel from './pages/StudentPanel';
import FacultyPanel from './pages/FacultyPanel';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [page, setPage] = useState('landing'); // landing | login | student | faculty | admin
  const [loginRole, setLoginRole] = useState(null);
  const [user, setUser] = useState(null);

  const [theme, setTheme] = useState('dark');
useEffect(() => {
  const saved = localStorage.getItem('scalora_user');
  const savedTheme = localStorage.getItem('scalora_theme');
if (savedTheme) {
  setTheme(savedTheme);
  document.body.className = savedTheme;
}

  if (saved) {
    const u = JSON.parse(saved);
    setUser(u);

    if (u.role === 'student') setPage('student');
    else if (u.role === 'faculty') setPage('faculty');
    else if (u.role === 'admin') setPage('admin');
    else setPage('landing');
  }
}, []);
useEffect(() => {
  document.body.className = theme;
  localStorage.setItem('scalora_theme', theme);
}, [theme]);

const handleLogin = (loggedUser) => {
  setUser(loggedUser);
  localStorage.setItem('scalora_user', JSON.stringify(loggedUser));

  if (loggedUser.role === 'student') setPage('student');
  else if (loggedUser.role === 'faculty') setPage('faculty');
  else if (loggedUser.role === 'admin') setPage('admin');
};
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scalora_user');
    setPage('landing');
  };
  const toggleTheme = () => {
  setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
};

  const handleRoleSelect = (role) => {
    setLoginRole(role);
    setPage('login');
  };

  if (page === 'landing') return <LandingPage onRoleSelect={handleRoleSelect} />;
  if (page === 'login') return <LoginPage role={loginRole} onLogin={handleLogin} onBack={() => setPage('landing')} />;
  if (page === 'student') return <StudentPanel 
  user={user} 
  onLogout={handleLogout}
  toggleTheme={toggleTheme}
  theme={theme}
/>
  if (page === 'faculty') return <FacultyPanel 
  user={user} 
  onLogout={handleLogout}
  toggleTheme={toggleTheme}
  theme={theme}
/>
  if (page === 'admin') return <AdminPanel 
  user={user} 
  onLogout={handleLogout}
  toggleTheme={toggleTheme}
  theme={theme}
/>

  return null;
}
