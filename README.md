# LeadFlow — Lead Management Platform

A full-stack lead management application built for small sales teams, with role-based access control, a lead pipeline, timestamped notes, and a complete activity trail.

**[Live Demo →](YOUR_DEPLOYED_URL_HERE)**

Built for Digital Heroes Training Task · [digitalheroesco.com](https://digitalheroesco.com)

---

## Demo Credentials

| Role   | Email                       | Password     |
| ------ | --------------------------- | ------------ |
| Admin  | admin@leadplatform.com      | admin12345   |
| Member | member@leadplatform.com     | member12345  |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + Vite)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │AuthContext│  │ LeadsPage│  │LeadDetail│  │ Dashboard  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └──────────────┴─────────────┴──────────────┘         │
│                          axios + interceptors                │
└──────────────────────────┬──────────────────────────────────┘
                           │ /api
┌──────────────────────────┴──────────────────────────────────┐
│                  Server (Express + Node.js)                  │
│                                                              │
│  Middleware Stack:                                            │
│  helmet → cors → rate-limit → json → morgan                 │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Auth Routes   │  │ Lead Routes   │  │  User Routes     │  │
│  │ /api/auth/*   │  │ /api/leads/*  │  │  /api/users      │  │
│  └──────┬───────┘  └──────┬────────┘  └────────┬─────────┘  │
│         │                 │                     │            │
│  ┌──────┴─────────────────┴─────────────────────┴─────────┐ │
│  │                   Controllers                           │ │
│  │  validate → authenticate → authorize → handler → error  │ │
│  └─────────────────────┬───────────────────────────────────┘ │
│                        │                                     │
│  ┌─────────────────────┴───────────────────────────────────┐ │
│  │              Mongoose Models (User, Lead)                │ │
│  └─────────────────────┬───────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │
                  ┌──────┴──────┐
                  │   MongoDB   │
                  └─────────────┘
```

### Key Design Decisions

- **Layered architecture**: Routes → Validators → Controllers → Models. Business logic never leaks into route definitions.
- **Role-based access on both sides**: Server middleware (`authenticate`, `authorize`) enforces permissions. Client-side `ProtectedRoute` and `useAuth` mirror these checks for UX, but the server is the source of truth.
- **Activity trail**: Every mutation (status change, assignment, note, update) pushes to an embedded activity array on the Lead document. This is intentionally denormalized — activity is always read alongside its lead, never queried independently.
- **Scoped data access**: Members only see leads assigned to them. This is enforced at the query level in the controller, not just hidden in the UI.

---

## API Contract

### Authentication

| Method | Endpoint             | Auth     | Description                          |
| ------ | -------------------- | -------- | ------------------------------------ |
| POST   | `/api/auth/register` | Public   | Register a new user                  |
| POST   | `/api/auth/login`    | Public   | Login, returns token pair            |
| POST   | `/api/auth/refresh`  | Public   | Exchange refresh token for new pair  |
| GET    | `/api/auth/me`       | Bearer   | Get current user profile             |

### Leads

| Method | Endpoint                    | Auth        | Description                          |
| ------ | --------------------------- | ----------- | ------------------------------------ |
| POST   | `/api/leads`                | Public      | Capture a new lead (public form)     |
| GET    | `/api/leads`                | Bearer      | List leads (paginated, filterable)   |
| GET    | `/api/leads/stats`          | Admin       | Pipeline stats (counts by status)    |
| GET    | `/api/leads/:id`            | Bearer      | Get single lead with notes/activity  |
| PUT    | `/api/leads/:id`            | Bearer      | Update lead fields                   |
| PATCH  | `/api/leads/:id/status`     | Bearer      | Transition lead status               |
| PATCH  | `/api/leads/:id/assign`     | Admin       | Assign lead to a team member         |
| POST   | `/api/leads/:id/notes`      | Bearer      | Add timestamped note                 |
| DELETE | `/api/leads/:id`            | Admin       | Delete a lead                        |

### Users

| Method | Endpoint       | Auth  | Description          |
| ------ | -------------- | ----- | -------------------- |
| GET    | `/api/users`   | Admin | List all team members|

### Query Parameters (GET /api/leads)

| Param      | Type   | Default     | Description                            |
| ---------- | ------ | ----------- | -------------------------------------- |
| page       | int    | 1           | Page number                            |
| limit      | int    | 20 (max 100)| Items per page                         |
| status     | string | —           | Filter by status                       |
| assignedTo | string | —           | Filter by assigned user ID (admin)     |
| search     | string | —           | Search name, email, company            |
| sortBy     | string | createdAt   | Sort field                             |
| order      | string | desc        | Sort order (asc/desc)                  |

### Response Format

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

### Status Codes

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created                                  |
| 400  | Validation error or bad request          |
| 401  | Not authenticated or token expired       |
| 403  | Authenticated but not authorized         |
| 404  | Resource not found                       |
| 409  | Conflict (duplicate email, etc.)         |
| 429  | Rate limit exceeded                      |
| 500  | Internal server error                    |

---

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6, Axios  |
| Backend    | Node.js, Express 4, Mongoose 8                        |
| Database   | MongoDB                                               |
| Auth       | JWT (access + refresh tokens), bcryptjs                |
| Validation | express-validator                                     |
| Security   | helmet, cors, express-rate-limit                      |
| Testing    | Jest, Supertest, mongodb-memory-server                |
| CI         | GitHub Actions                                        |

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install & Run

```bash
# Clone
git clone https://github.com/parthksingh1/Lead-Platform.git
cd Lead-Platform

# Server setup
cd server
cp .env.example .env    # Edit with your MongoDB URI and JWT secret
npm install
npm run seed            # Creates demo users + sample leads
npm run dev             # Starts on :5000

# Client setup (new terminal)
cd client
npm install
npm run dev             # Starts on :5173 with API proxy to :5000
```

### Run Tests

```bash
cd server
npm test                # Runs auth + leads test suites
npm run test:coverage   # With coverage report
```

---

## Deployment

### Backend (Render)

1. Create a new Web Service, connect your GitHub repo
2. Build command: `cd server && npm install`
3. Start command: `cd server && npm start`
4. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`

### Frontend (Vercel)

1. Import repo, set root directory to `client`
2. Set `VITE_API_URL` environment variable to your Render backend URL + `/api`
3. Deploy

### Alternative: Single Server

The Express server serves the React build in production mode:

```bash
cd client && npm run build   # Outputs to client/dist
cd ../server && npm start    # Serves API + static files
```

---

## Project Structure

```
lead-platform/
├── .github/workflows/ci.yml    # CI pipeline
├── server/
│   ├── src/
│   │   ├── config/              # Env config, DB connection
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── models/              # Mongoose schemas (User, Lead)
│   │   ├── routes/              # Route definitions
│   │   ├── utils/               # AppError, token generation
│   │   ├── validators/          # express-validator rule sets
│   │   ├── app.js               # Express app setup
│   │   ├── server.js            # Entry point
│   │   └── seed.js              # Database seeding
│   └── tests/
│       ├── setup.js             # MongoDB memory server setup
│       ├── helpers.js           # Test utilities
│       ├── auth.test.js         # Auth endpoint tests
│       └── leads.test.js        # Lead CRUD + permission tests
├── client/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # AuthContext (global state)
│   │   ├── pages/               # Route-level page components
│   │   ├── services/            # API client with interceptors
│   │   └── App.jsx              # Router configuration
│   └── index.html
└── README.md
```

---

## License

This project was built as a qualification task for Digital Heroes. All rights reserved.
