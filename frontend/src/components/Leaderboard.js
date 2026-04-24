import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CATEGORIES = ['All', 'SIH', 'Coding', 'Mini Hackathon', 'Other Hackathon', 'Academic'];
const MEDALS = ['🥇', '🥈', '🥉'];

function AvatarEl({ name, pic, size = 40 }) {
  if (pic) return <img src={pic} alt={name} className="avatar" style={{ width: size, height: size }} />;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name ? name[0].toUpperCase() : '?'}
    </div>
  );
}

export default function Leaderboard({ currentUser, filterCategory, onFilterChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLike = async (studentId) => {
    if (!currentUser || (currentUser.role !== 'student' && currentUser.role !== 'admin')) return;
    try {
      const res = await axios.post(`/api/students/${studentId}/like`, {
        likerId: currentUser.id, likerRole: currentUser.role
      });
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, likedBy: res.data.liked
          ? [...(s.likedBy || []), currentUser.id]
          : (s.likedBy || []).filter(id => id !== currentUser.id)
        } : s
      ));
    } catch (e) { alert('Error liking'); }
  };

  const filtered = filterCategory && filterCategory !== 'All'
    ? students.filter(s => (s.achievements || []).some(a => a.category === filterCategory))
    : students;

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="lb-container">
      {/* Filter tabs */}
      <div className="lb-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`lb-filter-btn ${(filterCategory || 'All') === cat ? 'active' : ''}`}
            onClick={() => onFilterChange && onFilterChange(cat)}
          >{cat}</button>
        ))}
      </div>

      <div className="lb-header-row">
        <span className="section-title">🏆 Leaderboard</span>
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No students found</div>
      ) : (
        <div className="lb-list">
          {filtered.map((student, idx) => {
            const isLiked = (student.likedBy || []).includes(currentUser?.id);
            const canLike = currentUser?.role === 'student' || currentUser?.role === 'admin';
            const rankBadge = idx < 3 ? MEDALS[idx] : `#${idx + 1}`;
            return (
              <div key={student.id} className={`lb-row ${idx < 3 ? 'top-row' : ''}`}>
                <div className="lb-rank">{rankBadge}</div>
                <AvatarEl name={student.name} pic={student.profilePic} size={44} />
                <div className="lb-info">
                  <div className="lb-name">{student.name}</div>
                  <div className="lb-meta">
                    <span className="badge badge-red">{student.department}</span>
                    <span className="badge badge-gray">{student.year || 'N/A'}</span>
                    {student.uploadedByFaculty && (
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>by {student.uploadedByFaculty}</span>
                    )}
                  </div>
                  <div className="lb-achs">
                    {(student.achievements || []).slice(0, 3).map(a => (
                      <span key={a.id} className="ach-chip">{a.category} {a.year}</span>
                    ))}
                  </div>
                </div>
                <div className="lb-right">
                  <div className="lb-points">{(student.totalPoints || 0).toFixed(1)}<span>pts</span></div>
                  {student.leetcodeSolved > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'right' }}>
                      LeetCode: {student.leetcodeSolved}
                    </div>
                  )}
                  {canLike && (
                    <button
                      className={`like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(student.id)}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      {isLiked ? '❤️' : '🤍'} {(student.likedBy || []).length}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
