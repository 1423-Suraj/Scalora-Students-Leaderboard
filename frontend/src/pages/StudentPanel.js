import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import '../components/Leaderboard.css';
import './StudentPanel.css';

function AvatarEl({ name, pic, size = 56 }) {
  if (pic) return <img src={pic} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{name ? name[0].toUpperCase() : '?'}</div>;
}

export default function StudentPanel({ user, onLogout, setUser }) {
  const [view, setView] = useState('leaderboard');
  const [profile, setProfile] = useState(user);
  const [filterCat, setFilterCat] = useState('All');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get(`/api/students/${user.id}/notifications`).then(r => setNotifications(r.data)).catch(() => {});
    const interval = setInterval(() => {
      axios.get(`/api/students/${user.id}/notifications`).then(r => setNotifications(r.data)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user.id]);

  const navItems = [
    { key: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { key: 'profile', icon: '👤', label: 'Profile' },
    { key: 'leetcode', icon: '💻', label: 'LeetCode' },
    { key: 'certificates', icon: '📜', label: 'Certificates' },
    { key: 'achievements', icon: '🎖️', label: 'Achievements' },
    { key: 'notifications', icon: '🔔', label: `Notifications${notifications.length > 0 ? ` (${notifications.length})` : ''}` },
  ];

  return (
    <div className="panel-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">SCALORA</div>
          <div className="logo-sub">Student Portal</div>
        </div>
        <div className="sidebar-user">
          <AvatarEl name={profile.name} pic={profile.profilePic} size={44} />
          <div>
            <div className="su-name">{profile.name}</div>
            <div className="su-dept">{profile.department} · {profile.year}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.key} className={`nav-item ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="points-display">
            <div className="pts-val">{(profile.totalPoints || 0).toFixed(1)}</div>
            <div className="pts-label">Total Points</div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 12, borderColor: 'rgba(200,16,46,0.5)', color: '#C8102E' }} onClick={onLogout}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {view === 'leaderboard' && <Leaderboard currentUser={profile} filterCategory={filterCat} onFilterChange={setFilterCat} />}
        {view === 'profile' && <ProfileView user={profile} setUser={u => { setProfile(u); setUser(u); }} />}
        {view === 'leetcode' && <LeetcodeView user={profile} setUser={u => { setProfile(u); setUser(u); }} />}
        {view === 'certificates' && <CertificatesView user={profile} />}
        {view === 'achievements' && <AchievementsView user={profile} />}
        {view === 'notifications' && <NotificationsView notifications={notifications} />}
      </main>
    </div>
  );
}

/* ---- Profile View ---- */
function ProfileView({ user, setUser }) {
  const [form, setForm] = useState({ name: user.name, department: user.department, profilePic: user.profilePic });
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    try {
      const res = await axios.put(`/api/students/${user.id}`, form);
      setUser(res.data.user);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Error saving'); }
  };

  const handlePic = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">My Profile</h1></div>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="profile-pic-section">
          <div className="avatar" style={{ width: 96, height: 96, fontSize: 38 }}>
            {form.profilePic ? <img src={form.profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (user.name?.[0] || '?')}
          </div>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            📷 Change Photo <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePic} />
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          <div className="input-group"><label>Full Name</label><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="input-group"><label>Email (not editable)</label><input className="input-field" value={user.email} disabled style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }} /></div>
          <div className="input-group"><label>Course</label><input className="input-field" value="B.Tech" disabled style={{ background: 'var(--gray-100)' }} /></div>
          <div className="input-group">
            <label>Department</label>
            <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option>CSE</option><option>AIML</option><option>DS</option><option>ECE</option>
            </select>
          </div>
          {msg && <p className={msg.includes('Error') ? 'error-msg' : 'success-msg'}>{msg}</p>}
          <button className="btn btn-primary" onClick={handleSave}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}

/* ---- LeetCode View ---- */
function LeetcodeView({ user, setUser }) {
  const [username, setUsername] = useState(user.leetcodeUsername || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!username) return;
    setLoading(true); setMsg('');
    try {
      const res = await axios.post(`/api/students/${user.id}/leetcode`, { username });
      const updated = { ...user, leetcodeUsername: username, leetcodeSolved: res.data.solved, leetcodePoints: res.data.points };
      setUser(updated);
      setMsg(`Fetched! ${res.data.solved} solved → ${res.data.points} points${res.data.note ? ' (' + res.data.note + ')' : ''}`);
    } catch (e) { setMsg('Error fetching LeetCode data'); }
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">LeetCode Integration</h1></div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="lc-stats-row">
          <div className="lc-stat"><div className="lc-stat-val">{user.leetcodeSolved || 0}</div><div className="lc-stat-label">Problems Solved</div></div>
          <div className="lc-stat"><div className="lc-stat-val" style={{ color: 'var(--red)' }}>{user.leetcodePoints || 0}</div><div className="lc-stat-label">Points Earned</div></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20, marginTop: 16 }}>1 solved problem = 0.5 points</p>
        <div className="input-group"><label>LeetCode Username</label>
          <input className="input-field" placeholder="your-leetcode-username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        {msg && <p className={msg.includes('Error') ? 'error-msg' : 'success-msg'} style={{ marginTop: 8 }}>{msg}</p>}
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching...' : '↻ Fetch & Sync LeetCode Data'}
        </button>
      </div>
    </div>
  );
}

/* ---- Certificates View ---- */
function CertificatesView({ user }) {
  const [form, setForm] = useState({ name: '', category: 'SIH', year: new Date().getFullYear().toString(), url: '' });
  const [certs, setCerts] = useState(user.certificates || []);
  const [msg, setMsg] = useState('');

  const handleUpload = async () => {
    if (!form.name) return;
    try {
      const res = await axios.post(`/api/students/${user.id}/certificates`, form);
      setCerts(c => [...c, res.data.certificate]);
      setForm({ name: '', category: 'SIH', year: new Date().getFullYear().toString(), url: '' });
      setMsg('Certificate saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Error saving'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Certificates</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Upload Certificate</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group"><label>Certificate Name</label><input className="input-field" placeholder="e.g. SIH Winner 2024" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="input-group"><label>Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option>SIH</option><option>Coding</option><option>Mini Hackathon</option><option>Other Hackathon</option><option>Academic</option>
              </select>
            </div>
            <div className="input-group"><label>Year</label><input className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
            <div className="input-group"><label>Certificate URL (optional)</label><input className="input-field" placeholder="https://..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
            {msg && <p className={msg.includes('Error') ? 'error-msg' : 'success-msg'}>{msg}</p>}
            <button className="btn btn-primary" onClick={handleUpload}>Upload Certificate</button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>My Certificates ({certs.length})</h3>
          {certs.length === 0 ? <p style={{ color: 'var(--gray-400)' }}>No certificates yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certs.map(c => (
                <div key={c.id} style={{ background: 'var(--gray-100)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span className="badge badge-red">{c.category}</span>
                    <span className="badge badge-gray">{c.year}</span>
                  </div>
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', fontSize: 12, marginTop: 4, display: 'block' }}>View →</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Achievements View ---- */
function AchievementsView({ user }) {
  const achievements = user.achievements || [];
  const grouped = achievements.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Achievements History</h1></div>
      {Object.keys(grouped).length === 0 ? (
        <div className="card"><p style={{ color: 'var(--gray-400)', textAlign: 'center' }}>No achievements yet. Ask faculty to add your achievements!</p></div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 12 }}>{cat}</h3>
            <table className="data-table">
              <thead><tr><th>Year</th><th>Rank</th><th>Points</th><th>Added By</th></tr></thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id}>
                    <td>{a.year}</td>
                    <td>{a.rank || (a.sgpa ? `SGPA: ${a.sgpa}` : '—')}</td>
                    <td><strong style={{ color: 'var(--red)' }}>{a.points}</strong></td>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{a.addedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

/* ---- Notifications View ---- */
function NotificationsView({ notifications }) {
  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Notifications</h1></div>
      <div className="card">
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>No new notifications</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} style={{ background: 'var(--red-faint)', border: '1.5px solid rgba(200,16,46,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>❤️</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
