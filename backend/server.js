const express = require('express');
const cors = require('cors');
const path = require('path');
const { cleanOldNotifications, rebuildLeaderboard } = require('./db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Clean notifications & rebuild leaderboard every hour
setInterval(() => {
  cleanOldNotifications();
  rebuildLeaderboard();
}, 60 * 60 * 1000);

// Initial build
rebuildLeaderboard();

app.listen(PORT, () => {
 console.log(`🚀 Scalora Backend running on http://localhost:${PORT}`);
});
