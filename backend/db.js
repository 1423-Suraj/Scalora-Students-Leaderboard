const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database');

function readJSON(filename) {
  try {
    const data = fs.readFileSync(path.join(DB_PATH, filename), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(DB_PATH, filename), JSON.stringify(data, null, 2));
}

function rebuildLeaderboard() {
  const users = readJSON('users.json');
  const students = users
    .filter(u => u.role === 'student' && !u.isBlocked)
    .map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      department: s.department,
      year: s.year,
      course: s.course,
      profilePic: s.profilePic,
      totalPoints: s.totalPoints || 0,
      leetcodeSolved: s.leetcodeSolved || 0,
      leetcodePoints: s.leetcodePoints || 0,
      achievements: s.achievements || [],
      likes: s.likes || [],
      likedBy: s.likedBy || [],
      uploadedByFaculty: s.uploadedByFaculty || null,
      isBlocked: s.isBlocked
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 200);

  writeJSON('leaderboard.json', students);
  return students;
}

function cleanOldNotifications() {
  const notifications = readJSON('notifications.json');
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  const fresh = notifications.filter(n => new Date(n.createdAt).getTime() > sixHoursAgo);
  writeJSON('notifications.json', fresh);
}

function recalcStudentPoints(userId) {
  const users = readJSON('users.json');
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;

  const student = users[idx];
  let total = student.leetcodePoints || 0;

  (student.achievements || []).forEach(ach => {
    total += ach.points || 0;
  });

  users[idx].totalPoints = total;
  writeJSON('users.json', users);
  rebuildLeaderboard();
}

module.exports = { readJSON, writeJSON, rebuildLeaderboard, cleanOldNotifications, recalcStudentPoints };
