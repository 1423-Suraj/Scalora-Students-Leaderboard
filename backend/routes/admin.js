const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, rebuildLeaderboard } = require('../db');

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = readJSON('users.json');
  res.json(users.map(({ password, ...u }) => u));
});

// POST /api/admin/block/:id
router.post('/block/:id', (req, res) => {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users[idx].isBlocked = true;
  writeJSON('users.json', users);
  rebuildLeaderboard();
  res.json({ success: true, message: 'User blocked' });
});

// POST /api/admin/unblock/:id
router.post('/unblock/:id', (req, res) => {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  users[idx].isBlocked = false;
  writeJSON('users.json', users);
  rebuildLeaderboard();
  res.json({ success: true, message: 'User unblocked' });
});

// PUT /api/admin/users/:id - admin can edit profiles
router.put('/users/:id', (req, res) => {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  const allowed = ['name', 'department', 'profilePic', 'year'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) users[idx][key] = req.body[key];
  });

  writeJSON('users.json', users);
  rebuildLeaderboard();
  const { password, ...safe } = users[idx];
  res.json({ success: true, user: safe });
});

module.exports = router;
