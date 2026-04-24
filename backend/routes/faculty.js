const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, rebuildLeaderboard, recalcStudentPoints } = require('../db');

const POINTS_MAP = {
  SIH: { '1st': 20, '2nd': 18, '3rd': 16 },
  'Mini Hackathon': { '1st': 10, '2nd': 8, '3rd': 6 },
  'Other Hackathon': { '1st': 10, '2nd': 8, '3rd': 6 },
  Academic: null, // SGPA = points
  Coding: null    // Auto from LeetCode
};

// GET /api/faculty/students - search students
router.get('/students', (req, res) => {
  const { q } = req.query;
  const users = readJSON('users.json');
  let students = users.filter(u => u.role === 'student');
  if (q) {
    const query = q.toLowerCase();
    students = students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.department || '').toLowerCase().includes(query)
    );
  }
  res.json(students.map(({ password, ...s }) => s));
});

// POST /api/faculty/achievements - add achievement
router.post('/achievements', (req, res) => {
  const { studentId, studentEmail, category, year, rank, sgpa, facultyName, facultyId } = req.body;

  if (!category || !year) {
    return res.status(400).json({ error: 'Category and year are required' });
  }

  const users = readJSON('users.json');
  let studentIdx = -1;

  if (studentId) {
    studentIdx = users.findIndex(u => u.id === studentId);
  } else if (studentEmail) {
    studentIdx = users.findIndex(u => u.email === studentEmail);
  }

  if (studentIdx === -1) return res.status(404).json({ error: 'Student not found' });

  const student = users[studentIdx];

  // SIH max 2 per year
  if (category === 'SIH') {
    const sihThisYear = (student.achievements || []).filter(
      a => a.category === 'SIH' && a.year === year
    );
    if (sihThisYear.length >= 2) {
      return res.status(400).json({ error: 'SIH allows max 2 entries per year' });
    }
  }

  // Calculate points
  let points = 0;
  if (category === 'Academic') {
    points = parseFloat(sgpa) || 0;
  } else if (category === 'Coding') {
    points = student.leetcodePoints || 0;
  } else {
    const catMap = POINTS_MAP[category];
    if (catMap && rank) {
      points = catMap[rank] || 0;
    }
  }

  const achievement = {
    id: uuidv4(),
    category,
    year,
    rank: rank || null,
    sgpa: category === 'Academic' ? sgpa : null,
    points,
    addedBy: facultyName || 'Faculty',
    addedById: facultyId || null,
    addedAt: new Date().toISOString()
  };

  users[studentIdx].achievements = users[studentIdx].achievements || [];
  users[studentIdx].achievements.push(achievement);
  let total = 0;

const allAchievements = users[studentIdx].achievements || [];

allAchievements.forEach(a => {
  total += a.points || 0;
});

// LeetCode points भी add करो (अगर है)
if (users[studentIdx].leetcodePoints) {
  total += users[studentIdx].leetcodePoints;
}

users[studentIdx].totalPoints = total;
  if (facultyName) users[studentIdx].uploadedByFaculty = facultyName;

  writeJSON('users.json', users);
  recalcStudentPoints(student.id);

  res.json({ success: true, achievement, newTotal: users[studentIdx].totalPoints });
});

// DELETE /api/faculty/achievements/:studentId/:achievementId
router.delete('/achievements/:studentId/:achievementId', (req, res) => {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.studentId);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  users[idx].achievements = (users[idx].achievements || []).filter(
    a => a.id !== req.params.achievementId
  );
  writeJSON('users.json', users);
  recalcStudentPoints(req.params.studentId);

  res.json({ success: true });
});

module.exports = router;
