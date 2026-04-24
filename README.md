# 🏆 Scalora – Students Leaderboard System

A full-stack leaderboard system for ITS College built with React + Node.js + JSON file storage.

---

## 📁 Project Structure

```
scalora/
├── backend/           # Node.js + Express API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── faculty.js
│   │   └── admin.js
│   ├── db.js
│   └── server.js
├── frontend/          # React.js app
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.js
│       │   ├── LoginPage.js
│       │   ├── StudentPanel.js
│       │   ├── FacultyPanel.js
│       │   └── AdminPanel.js
│       └── components/
│           └── Leaderboard.js
└── database/          # JSON file storage
    ├── users.json
    ├── leaderboard.json
    └── notifications.json
```

---

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js v16+ 
- npm v8+

---

### Step 1 – Start the Backend

```bash
cd scalora/backend
npm install
npm start
# Server runs at http://localhost:5000
```

For development with auto-reload:
```bash
npm run dev
```

---

### Step 2 – Start the Frontend

Open a **second terminal**:

```bash
cd scalora/frontend
npm install
npm start
# App opens at http://localhost:3000
```

The frontend proxies API calls to `http://localhost:5000` automatically.

---

## 🔑 Demo Credentials

### Admin
- Email: `ashish.cse@its.edu.in`
- Password: `admin123`

### Faculty
- Email: `priya.aiml@its.edu.in`
- Password: `faculty123`

### Student
- Email: `rahul_cse2022@its.edu.in`
- Password: `student123`

---

## 📧 Email Format Rules

| Role | Format | Example |
|------|--------|---------|
| Student | `name_departmentyear@its.edu.in` | `priya_cse2022@its.edu.in` |
| Faculty | `name.department@its.edu.in` | `dr.cse@its.edu.in` |
| Admin | `name.department@its.edu.in` | `admin.cse@its.edu.in` |

---

## 🎯 Points System

| Category | 1st | 2nd | 3rd |
|----------|-----|-----|-----|
| SIH | 20 | 18 | 16 |
| Mini Hackathon | 10 | 8 | 6 |
| Other Hackathon | 10 | 8 | 6 |
| Academic | SGPA = points | — | — |
| Coding (LeetCode) | 0.5 pts per solved | — | — |

---

## 🔌 REST API Reference

### Auth
- `POST /api/auth/signup` – Register new user
- `POST /api/auth/login` – Login

### Students
- `GET /api/students` – Leaderboard (top 200)
- `GET /api/students/:id` – Student profile
- `PUT /api/students/:id` – Update profile
- `POST /api/students/:id/leetcode` – Sync LeetCode
- `POST /api/students/:id/like` – Like/unlike
- `GET /api/students/:id/notifications` – Get notifications
- `POST /api/students/:id/certificates` – Add certificate

### Faculty
- `GET /api/faculty/students?q=search` – Search students
- `POST /api/faculty/achievements` – Add achievement
- `DELETE /api/faculty/achievements/:studentId/:achId` – Remove achievement

### Admin
- `GET /api/admin/users` – All users
- `POST /api/admin/block/:id` – Block user
- `POST /api/admin/unblock/:id` – Unblock user
- `PUT /api/admin/users/:id` – Edit user profile

---

## ✨ Features

- 🎬 Animated landing page with role selection
- 🔐 Auto role detection from email format
- 🏆 Live leaderboard (top 200, sorted by points)
- 💻 LeetCode data integration via GraphQL API
- 🎖️ Achievement tracking by category with auto-calculated points
- ❤️ Like system (students/admin) with notifications
- 🔔 Admin-like notifications (auto-delete after 6 hours)
- 🔒 Block/Unblock system for admin
- 📜 Certificate upload per student
- 🎨 Red & White theme with Bebas Neue display font
