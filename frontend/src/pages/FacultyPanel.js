import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import '../components/Leaderboard.css';

function AvatarEl({ name, pic, size = 40 }) {
  if (pic) return <img src={pic} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>{name ? name[0].toUpperCase() : '?'}</div>;
}

export default function FacultyPanel({ user, onLogout }) {
  const [view, setView] = useState('leaderboard');
  const [filterCat, setFilterCat] = useState('All');

  const navItems = [
    { key: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { key: 'students', icon: '👥', label: 'Students' },
    { key: 'achievements', icon: '🎖️', label: 'Add Achievement' },
  ];

  return (
    <div className="panel-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">SCALORA</div>
          <div className="logo-sub">
  {user?.role === 'faculty' ? 'FACULTY PORTAL' : 'FACULTY PORTAL'}
</div>
        </div>
        <div style={{ padding: '12px 16px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          👨‍🏫 {user.name}
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
        {view === 'students' && <StudentsView faculty={user} />}
        {view === 'achievements' && <AddAchievementView faculty={user} />}
      </main>
    </div>
  );
}

/* ---- Students Search View ---- */
function StudentsView({ faculty }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/faculty/students?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => { search(''); }, [search]);

  if (selected) {
    return <StudentDetail student={selected} onBack={() => setSelected(null)} faculty={faculty} />;
  }

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Students</h1></div>
      <div className="card" style={{ marginBottom: 20 }}>
        <input className="input-field" placeholder="🔍 Search by name, email, or department..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%', fontSize: 15 }} />
      </div>
      {loading ? <div className="loading-spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setSelected(s)}>
              <AvatarEl name={s.name} pic={s.profilePic} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{s.email}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className="badge badge-red">{s.department}</span>
                  <span className="badge badge-gray">{s.year}</span>
                  {s.isBlocked && <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>Blocked</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>{(s.totalPoints || 0).toFixed(1)}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>points</div>
              </div>
              <span style={{ color: 'var(--gray-300)' }}>→</span>
            </div>
          ))}
          {results.length === 0 && <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No students found</p>}
        </div>
      )}
    </div>
  );
}

/* ---- Student Detail for Faculty ---- */
function StudentDetail({ student, onBack, faculty }) {
  const achs = student.achievements || [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="section-title">{student.name}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <AvatarEl name={student.name} pic={student.profilePic} size={64} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{student.name}</div>
              <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>{student.email}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span className="badge badge-red">{student.department}</span>
                <span className="badge badge-blue">{student.course}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Total Points', (student.totalPoints || 0).toFixed(1)], ['LeetCode Solved', student.leetcodeSolved || 0], ['LC Points', student.leetcodePoints || 0], ['Achievements', achs.length]].map(([label, val]) => (
              <div key={label} style={{ background: 'var(--gray-100)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Achievements</h3>
          {achs.length === 0 ? <p style={{ color: 'var(--gray-400)' }}>No achievements</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {achs.map(a => (
                <div key={a.id} style={{ background: 'var(--gray-100)', padding: 10, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{a.category}</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>{a.points} pts</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{a.year} · {a.rank || (a.sgpa ? `SGPA: ${a.sgpa}` : '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Add Achievement ---- */
function AddAchievementView({ faculty }) {
  const [form, setForm] = useState({ studentEmail: '', category: 'SIH', year: new Date().getFullYear().toString(), rank: '1st', sgpa: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.studentEmail) return setMsg('Student email is required');
    setLoading(true); setMsg('');
    try {
      const res = await axios.post('/api/faculty/achievements', { ...form, facultyName: faculty.name, facultyId: faculty.id });
      setMsg(`✅ Achievement added! New total: ${res.data.newTotal} pts`);
      setForm(f => ({ ...f, studentEmail: '' }));
    } catch (e) { setMsg('❌ ' + (e.response?.data?.error || 'Error')); }
    setLoading(false);
  };

  const showRank = ['SIH', 'Mini Hackathon', 'Other Hackathon'].includes(form.category);
  const showSGPA = form.category === 'Academic';

  return (
    <div className="animate-in">
      <div className="page-header"><h1 className="section-title">Add Achievement</h1></div>
      <div className="card" style={{ maxWidth: 540 }}>
        <div style={{ background: 'var(--gray-100)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13 }}>
          <strong>Points Rules:</strong> SIH (1st=20, 2nd=18, 3rd=16) · Hackathon (1st=10, 2nd=8, 3rd=6) · Academic (SGPA=pts) · Coding (auto from LeetCode)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group"><label>Student Email *</label><input className="input-field" placeholder="student_dept2022@its.edu.in" value={form.studentEmail} onChange={e => setForm(f => ({ ...f, studentEmail: e.target.value }))} /></div>
          <div className="input-group"><label>Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option>SIH</option><option>Mini Hackathon</option><option>Other Hackathon</option><option>Academic</option><option>Coding</option>
            </select>
          </div>
          <div className="input-group"><label>Year</label><input className="input-field" placeholder="2025" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
          {showRank && (
            <div className="input-group"><label>Rank</label>
              <select className="input-field" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}>
                <option>1st</option><option>2nd</option><option>3rd</option>
              </select>
            </div>
          )}
          {showSGPA && (
            <div className="input-group"><label>SGPA</label><input className="input-field" placeholder="e.g. 8.5" value={form.sgpa} onChange={e => setForm(f => ({ ...f, sgpa: e.target.value }))} /></div>
          )}
          {msg && <p className={msg.startsWith('❌') ? 'error-msg' : 'success-msg'}>{msg}</p>}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Add Achievement'}</button>
        </div>
      </div>
    </div>
  );
}
