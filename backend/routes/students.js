const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, rebuildLeaderboard, recalcStudentPoints } = require('../db');
const fetch = require('node-fetch');

// GET /api/students - get all students (leaderboard)
router.get('/', (req, res) => {
  const leaderboard = readJSON('leaderboard.json');
  res.json(leaderboard);
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  const users = readJSON('users.json');
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Student not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// PUT /api/students/:id - update profile
router.put('/:id', (req, res) => {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  const allowed = ['name', 'department', 'profilePic', 'leetcodeUsername'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) users[idx][key] = req.body[key];
  });

  writeJSON('users.json', users);
  rebuildLeaderboard();
  const { password, ...safe } = users[idx];
  res.json({ success: true, user: safe });
});

// POST /api/students/:id/leetcode - fetch & save leetcode data
router.post('/:id/leetcode', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables: { username } }),
      timeout: 8000
    });

    let solved = 0;
    if (response.ok) {
      const data = await response.json();
      const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum;
      if (stats) {
        const all = stats.find(s => s.difficulty === 'All');
        solved = all ? all.count : 0;
      }
    }

    const users = readJSON('users.json');
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });

    users[idx].leetcodeUsername = username;
    users[idx].leetcodeSolved = solved;
    users[idx].leetcodePoints = parseFloat((solved * 0.5).toFixed(1));
    writeJSON('users.json', users);
    recalcStudentPoints(req.params.id);

    res.json({ success: true, solved, points: users[idx].leetcodePoints });
  } catch (e) {
    // If LeetCode is unreachable, save username and return mock
    const users = readJSON('users.json');
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx !== -1) {
      users[idx].leetcodeUsername = username;
      writeJSON('users.json', users);
    }
    res.json({ success: true, solved: users[idx]?.leetcodeSolved || 0, points: users[idx]?.leetcodePoints || 0, note: 'LeetCode API unavailable, showing saved data' });
  }
});

// POST /api/students/:id/like - like/unlike
router.post('/:id/like', (req, res) => {
  const { likerId, likerRole } = req.body;
  if (!likerId) return res.status(400).json({ error: 'LikerId required' });
  if (likerRole !== 'student' && likerRole !== 'admin') return res.status(403).json({ error: 'Only students and admins can like' });

  const users = readJSON('users.json');
  const targetIdx = users.findIndex(u => u.id === req.params.id);
  if (targetIdx === -1) return res.status(404).json({ error: 'Student not found' });

  const liker = users.find(u => u.id === likerId);
  if (!liker) return res.status(404).json({ error: 'Liker not found' });

  const likedBy = users[targetIdx].likedBy || [];
  const alreadyLiked = likedBy.includes(likerId);

  if (alreadyLiked) {
    users[targetIdx].likedBy = likedBy.filter(id => id !== likerId);
  } else {
    users[targetIdx].likedBy.push(likerId);
    // Admin like triggers notification
    if (likerRole === 'admin') {
      const notifications = readJSON('notifications.json');
      const { v4: uuidv4 } = require('uuid');
      notifications.push({
        id: uuidv4(),
        targetStudentId: req.params.id,
        message: `${liker.name} liked your achievements`,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeJSON('notifications.json', notifications);
    }
  }

  writeJSON('users.json', users);
  rebuildLeaderboard();
  res.json({ success: true, liked: !alreadyLiked, likeCount: users[targetIdx].likedBy.length });
});

// GET /api/students/:id/notifications
router.get('/:id/notifications', (req, res) => {
  const notifications = readJSON('notifications.json');
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  const fresh = notifications
    .filter(n => n.targetStudentId === req.params.id && new Date(n.createdAt).getTime() > sixHoursAgo);
  res.json(fresh);
});

// POST /api/students/:id/certificates
router.post('/:id/certificates', (req, res) => {
  const { name, category, url, year } = req.body;
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  const cert = { id: Date.now().toString(), name, category, url, year, uploadedAt: new Date().toISOString() };
  users[idx].certificates = users[idx].certificates || [];
  users[idx].certificates.push(cert);
  writeJSON('users.json', users);
  res.json({ success: true, certificate: cert });
});

module.exports = router;
