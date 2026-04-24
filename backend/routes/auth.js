const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON, rebuildLeaderboard } = require('../db');

function detectRole(email) {
  email = email.toLowerCase();

  if (!email.endsWith('@its.edu.in')) {
    return null;
  }

  const local = email.split('@')[0];

  if (local.includes('_')) {
    return 'student';
  }

  if (local.startsWith('admin.')) {
    return 'admin';
  }

  if (local.includes('.')) {
    return 'faculty';
  }

  return null;
}

function parseStudentEmail(email) {
  // format: name_departmentyear@its.edu.in
  const local = email.split('@')[0];
  const parts = local.split('_');
  if (parts.length < 2) return { name: local, department: '', year: '' };
  const name = parts[0];
  const rest = parts[1];
  const deptMatch = rest.match(/^([a-zA-Z]+)(\d+)$/);
  if (deptMatch) {
    return { name, department: deptMatch[1].toUpperCase(), year: deptMatch[2] };
  }
  return { name, department: rest, year: '' };
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password, department, profilePic } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const users = readJSON('users.json');
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const role = detectRole(email);
  if (!role) return res.status(400).json({ error: 'Invalid college email format' });

  let parsed = {};
  if (role === 'student') {
    parsed = parseStudentEmail(email);
  }

  const newUser = {
    id: uuidv4(),
    name: name || parsed.name || email.split('@')[0],
    email,
    password,
    role,
    department: department || parsed.department || '',
    year: parsed.year || '',
    course: role === 'student' ? 'B.Tech' : undefined,
    isBlocked: false,
    profilePic: profilePic || null,
    leetcodeUsername: null,
    leetcodeSolved: 0,
    leetcodePoints: 0,
    totalPoints: 0,
    likes: [],
    likedBy: [],
    achievements: [],
    certificates: [],
    uploadedByFaculty: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON('users.json', users);
  rebuildLeaderboard();

  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, requestedRole } = req.body;

  const users = readJSON('users.json');

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 🔥 ROLE RULES

  if (requestedRole === 'student' && user.role !== 'student') {
    return res.status(403).json({
      error: 'Only students can login here'
    });
  }

  if (requestedRole === 'faculty' && user.role !== 'faculty') {
    return res.status(403).json({
      error: 'Only faculty can login here'
    });
  }

  if (requestedRole === 'admin' && !['admin', 'faculty'].includes(user.role)) {
    return res.status(403).json({
      error: 'Only admin or faculty can login here'
    });
  }

  // ✅ FINAL RESPONSE
  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser
  });
});