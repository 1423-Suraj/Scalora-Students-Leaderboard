import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import '../components/Leaderboard.css';

function AvatarEl({ name, pic, size = 40 }) {
  if (pic) return <img src={pic} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{name ? name[0].toUpperCase() : '?'}</div>;
}

export default function AdminPanel({ user, onLogout }) {
  const [view, setView] = useState('leaderboard');
  const [filterCat, setFilterCat] = useState('All');

  const navItems = [
    { key: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { key: 'users', icon: '👥', label: 'All Users' },
    { key: 'block', icon: '🔒', label: 'Block / Unblock' },
  ];

  return (
    <div className="panel-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">SCALORA</div>
          <div className="logo-sub">
  {user?.role === 'admin' ? 'ADMIN PORTAL' : 'ADMIN PORTAL'}
</div>
        </div>
        <div style={{ padding: '12px 16px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          🛡️ {user.name}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.key} className={`nav-item ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline btn-sm" style={{ width: '100%', borderColor: 'rgba(200,16,46,0.5)', color: '#C8102E' }} onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {view === 'leaderboard' && <Leaderboard currentUser={user} filterCategory={filterCat} onFilterChange={setFilterCat} />}
        {view === 'users' && <AllUsersView admin={user} />}
        {view === 'block' && <BlockSystemView />}
      </main>
    </div>
  );
}

/* ---- All Users ---- */
function AllUsersView({ admin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await axios.get('/api/admin/users'); setUsers(res.data); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (selected) return <EditUser user={selected} admin={admin} onBack={() => { setSelected(null); load(); }} />;

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">All Users</h1></div>
      {loading ? <div className="loading-spinner" /> : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Points</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AvatarEl name={u.name} pic={u.profilePic} size={32} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'faculty' ? 'badge-blue' : 'badge-gray'}`}>{u.role}</span></td>
                  <td>{u.department || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{(u.totalPoints || 0).toFixed(1)}</td>
                  <td>{u.isBlocked ? <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>Blocked</span> : <span className="badge badge-green">Active</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(u)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---- Edit User ---- */
function EditUser({ user, admin, onBack }) {
  const [form, setForm] = useState({ name: user.name, department: user.department || '', year: user.year || '' });
  const [msg, setMsg] = useState('');

  const save = async () => {
    try {
      await axios.put(`/api/admin/users/${user.id}`, form);
      setMsg('Saved!');
      setTimeout(onBack, 1000);
    } catch (e) { setMsg('Error'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="section-title">Edit Profile</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Name</label><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="input-group"><label>Department</label>
            <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option>CSE</option><option>AIML</option><option>DS</option><option>ECE</option>
            </select>
          </div>
          <div className="input-group"><label>Year</label><input className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
          {msg && <p className={msg === 'Saved!' ? 'success-msg' : 'error-msg'}>{msg}</p>}
          <button className="btn btn-primary" onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ---- Block System ---- */
function BlockSystemView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await axios.get('/api/admin/users'); setUsers(res.data.filter(u => u.role === 'student')); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (id, action) => {
    try {
      await axios.post(`/api/admin/${action}/${id}`);
      load();
    } catch (e) { alert('Error'); }
  };

  const filtered = users.filter(u => filter === 'all' ? true : filter === 'blocked' ? u.isBlocked : !u.isBlocked);

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Block / Unblock Students</h1></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'active', 'blocked'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <div className="loading-spinner" /> : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Department</th><th>Status</th><th>Points</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{u.email}</div>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.isBlocked ? <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>Blocked</span> : <span className="badge badge-green">Active</span>}</td>
                  <td style={{ fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{(u.totalPoints || 0).toFixed(1)}</td>
                  <td>
                    {u.isBlocked
                      ? <button className="btn btn-success btn-sm" onClick={() => handleBlock(u.id, 'unblock')}>Unblock</button>
                      : <button className="btn btn-danger btn-sm" onClick={() => handleBlock(u.id, 'block')}>Block</button>
                    }
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No students</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
