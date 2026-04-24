import React, { useState, useEffect } from 'react';
import './Landing.css';

export default function LandingPage({ onRoleSelect }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => setPhase(3), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="bg-circle c1" />
        <div className="bg-circle c2" />
        <div className="bg-circle c3" />
        <div className="grid-overlay" />
      </div>

      <div className="landing-content">
        <div className={`anim-block ${phase >= 1 ? 'visible' : ''}`}>
          <div className="logo-badge">EST. ITS</div>
          <h1 className="headline">
            <span className="word w1">SCALORA</span>
            <span className="word w2">PRESENTS</span>
          </h1>
          <h2 className={`subheadline ${phase >= 2 ? 'slide-in' : ''}`}>
            Students Leaderboard
          </h2>
          <p className={`tagline ${phase >= 2 ? 'fade-in' : ''}`}>
            Track. Compete. Excel.
          </p>
        </div>

        <div className={`role-cards ${phase >= 3 ? 'cards-visible' : ''}`}>
          <p className="choose-label">Select your role to continue</p>
          <div className="cards-row">
            {[
              { role: 'student', icon: '🎓', label: 'Student', desc: 'View leaderboard & upload achievements' },
              { role: 'faculty', icon: '👨‍🏫', label: 'Faculty', desc: 'Manage student achievements & scores' },
              { role: 'admin', icon: '🛡️', label: 'Admin', desc: 'Full system control & user management' },
            ].map((r, i) => (
              <button key={r.role} className="role-card" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => onRoleSelect(r.role)}>
                <div className="role-icon">{r.icon}</div>
                <div className="role-label">{r.label}</div>
                <div className="role-desc">{r.desc}</div>
                <div className="role-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-footer">
        <span>© 2025 ITS College · Scalora v1.0</span>
      </div>
    </div>
  );
}
