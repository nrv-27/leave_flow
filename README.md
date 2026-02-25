# 🗓 LeaveFlow — Automated Leave, Attendance & Workload Balancing System

A full-stack enterprise web application that intelligently manages leave requests, attendance tracking, team workload balancing, and project deadline validation with real-time notifications.

---

## ✨ Features

### Employee Portal
- 📅 **Apply Leave** with real-time AI impact analysis
- ⚡ **Instant auto-approval** for short leaves with no conflicts
- 🤖 **Smart suggestions** — best days to take leave
- 📊 **Attendance tracking** — check-in/out, monthly reports
- 📋 **Leave history** with pagination and filtering

### Manager Portal
- 📥 **Leave approval panel** with workload impact view
- 📈 **Analytics dashboard** — trends, breakdowns, heatmaps
- ⚙️ **Rule Engine configuration** — tweak auto-approval logic live
- 🚨 **Project deadline protection** with configurable windows
- 🔔 **Real-time notifications** via Socket.io

### AI Rule Engine
```
IF team_absence > 30%       → REJECT
IF deadline within 3 days   → REJECT (if critical project)
IF days <= 2 AND no issues  → AUTO-APPROVE
ELSE                        → SEND TO MANAGER
```
All rules are fully configurable per team.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens |
| Real-time | Socket.io |
| Deployment | Docker + Nginx |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone & Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Manager**: `manager@demo.com` / `password123`
- **Employee**: `employee@demo.com` / `password123`
- Sample projects and team data

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit: **http://localhost:5173**

---

## 🐳 Docker Deployment

```bash
# Start everything
docker-compose up -d

# Seed data
docker exec leave-system-backend node src/config/seed.js

# Stop
docker-compose down
```

---

## 📁 Project Structure

```
leave-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/
│   │   │   └── ruleEngine.js # AI decision logic
│   │   ├── middleware/        # Auth + role checks
│   │   ├── sockets/          # Real-time Socket.io
│   │   ├── config/           # DB connection + seed
│   │   └── server.js         # Entry point
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── employee/     # Employee dashboard pages
│   │   │   └── manager/      # Manager dashboard pages
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth + Socket contexts
│   │   ├── layouts/          # Sidebar layout
│   │   └── services/         # Axios API client
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leave/apply` | Apply for leave |
| GET | `/api/leave/my` | My leave history |
| GET | `/api/leave/team` | Team leaves (manager) |
| PATCH | `/api/leave/:id/status` | Approve/reject (manager) |
| GET | `/api/leave/impact-preview` | Preview impact before applying |
| GET | `/api/leave/suggestions` | Smart leave day suggestions |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/checkin` | Check in |
| POST | `/api/attendance/checkout` | Check out |
| GET | `/api/attendance/today` | Today's status |
| GET | `/api/attendance/report` | Monthly report |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/manager` | Manager analytics |
| GET | `/api/analytics/employee` | Employee analytics |

---

## 🔐 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leave-system
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🛡️ Security Features
- JWT access + refresh token rotation
- bcrypt password hashing (10 rounds)
- Role-based middleware (RBAC)
- Helmet.js security headers
- Rate limiting (100 req/15min)
- Input validation

---

## 📦 What's Next (Extend It)

- [ ] Redis caching for analytics
- [ ] Email notifications (Nodemailer)
- [ ] Google Calendar integration
- [ ] CSV export for leave reports
- [ ] Multi-team support
- [ ] Shift scheduling module

---

Built with ❤️ — Production-ready, modular, and extensible.
