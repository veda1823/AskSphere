# AskSphere 🌐

A beginner-friendly full-stack peer learning and homework Q&A web application inspired by **Brainly**.

Students can ask questions, answer questions from peers, earn points, and build their reputation.

---

## 🏗️ Architecture & Project Structure

AskSphere is organized as a decoupled monorepo:

```text
AskSphere/
├── client/                     # Frontend (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, QuestionCard, etc.)
│   │   ├── context/            # AuthContext (user session, points)
│   │   ├── pages/              # Home, QuestionDetail, AskQuestion, Profile, Login/Register
│   │   ├── services/           # api.js (Axios with JWT interceptor)
│   │   ├── App.jsx             # Main Router & Layout
│   │   └── index.css           # Tailwind styles
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Prisma ORM)
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (PostgreSQL)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # authMiddleware (JWT verification)
│   │   ├── routes/             # API routes
│   │   ├── utils/              # prisma.js singleton
│   │   └── server.js           # Express app & health check
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 recommended)
- **Git**

---

### 2. Backend Setup (`server/`)

1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Open `server/.env` and configure your **PostgreSQL** database:
   - **Neon** (Free serverless Postgres): [neon.tech](https://neon.tech)
     - Create a new project, copy the connection string, and paste it into `DATABASE_URL`.
   - **Supabase** (Free Postgres): [supabase.com](https://supabase.com)
     - Go to Project Settings -> Database -> Connection string (URI) and paste it into `DATABASE_URL`.

4. Push the Prisma schema to create the database tables:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`. Test the health check at:
   `http://localhost:5000/api/health`

---

### 3. Frontend Setup (`client/`)

1. Open a second terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
   - The green banner will verify that the frontend has successfully reached the backend health check!

---

## 👥 2-Person Team Task Split

| Area | Teammate A (Frontend Focus) | Teammate B (Backend Focus) |
|---|---|---|
| **Auth** | Login & Register pages, AuthContext, JWT storage in localStorage | `POST /api/auth/register`, `POST /api/auth/login`, bcrypt password hashing, JWT signing |
| **Questions** | Ask Question form, Question Feed card, Subject filter pills | `POST /api/questions`, `GET /api/questions`, subject query filtering |
| **Answers** | Answer submission form, Answer list, "Accept Brainliest" button | `POST /api/questions/:id/answers`, `PATCH /api/answers/:id/accept`, Points transaction logic |
| **Profile** | User profile page, points counter, asked/answered tabs | `GET /api/users/:id` returning user stats & activity history |

---

## 🗺️ Roadmap & Milestones

- [x] **Milestone 1**: Project Foundation (Client + Server + Prisma Schema + Health Check)
- [x] **Milestone 2**: Authentication & User System (JWT, bcrypt, Login/Register pages, Protected routes)
- [x] **Milestone 3**: Question Feed & Question Details (Posting questions, subject filters, detail view)
- [x] **Milestone 4**: Answering & Gamification (Posting answers, Brainliest accepted answer, points logic)
- [ ] **Milestone 5**: Profile Dashboard, Search & Final Polish
