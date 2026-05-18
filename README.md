# Job Application Tracker App

A full-stack job application tracker app built with React, Express, and Postgres. Demonstrates session-based authentication, session rehydration, auth-dependent data fetching, and conditional rendering — the same patterns students use in their full-stack projects.

This application is built to make navigating todays job market more bearable. Made for people currently on the job hunt and wants to stay organized throughout the process. Instead of losing track of applications across spreadsheets, notes apps, and memory, users get a single place to log every application, record where they applied, and keep tabs on where things stand. The goal is to reduce the mental overhead of a job search so users can focus on preparing for interviews rather than remembering who they applied to.

## User Stories

**Auth**
- A user can register for an account with a username and password
- A user can log in to an existing account
- A user can log out
- A returning user who has an active session is automatically logged in when they revisit the app

**Job Applications**
- logged-in user can see all of their job applications
- logged-in user can add a new job application by entering a company name, job title, and application URL
- logged-in user can update the status of an application (e.g. Applied, Interviewing, Offered, Rejected)
- logged-in user can delete a job application

## Schema

```
users
─────────────────────────────
user_id       SERIAL PRIMARY KEY
username      TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL

applications
─────────────────────────────
application_id      SERIAL PRIMARY KEY
company             TEXT NOT NULL
job_title           BOOLEAN DEFAULT FALSE
application_url     TEXT
status              TEXT DEFAULT 'Applied'
user_id             INTEGER REFERENCES users(user_id) ON DELETE CASCADE
```

A user has many job applications. Deleting a user cascades to delete all of their applications.

## API Contract

### Auth endpoints

| Method | Endpoint             | Request Body             | Response                          |
| ------ | -------------------- | ------------------------ | --------------------------------- |
| POST   | `/api/auth/register` | `{ username, password }` | `{ user_id, username }`           |
| POST   | `/api/auth/login`    | `{ username, password }` | `{ user_id, username }`           |
| DELETE | `/api/auth/logout`   | —                        | `{ message }`                     |
| GET    | `/api/auth/me`       | —                        | `{ user_id, username }` or `null` |

### Job Application endpoints (all require authentication)

| Method | Endpoint                            | Request Body                              | Response                                                                     |
| ------ | ----------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/applications`                 | —                                         | `[{ application_id, company, job_title, application_url, status, user_id }]` |
| POST   | `/api/applications`                 | `{ company, job_title, application_url }` | `{ application_id, company, job_title, application_url, status, user_id }`   |
| PATCH  | `/api/applications/:application_id` | `{ status }`                              | `{ application_id, company, job_title, application_url, status, user_id }`   |
| DELETE | `/api/applications/:application_id` | —                                         | `{ application_id, company, job_title, application_url, status, user_id }`   |

## Setup

### 1. Database

Create a local Postgres database:

```sh
createdb todos_casestudy
```

### 2. Server

```sh
cd server
npm install
cp .env.template .env
```

Open `.env` and fill in your Postgres credentials and a session secret. Then seed the database:

```sh
npm run db:seed
```

Start the server:

```sh
npm run dev
```

The server runs on `http://localhost:8080`.

### 3. Frontend

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. The Vite dev proxy forwards all `/api` requests to the Express server so session cookies work correctly.

## Seed Users

After running `npm run db:seed`, these accounts are available:

| Username | Password    |
| -------- | ----------- |
| alice    | password123 |
| bob      | password123 |

## Application Structure

```
swe-casestudy-7-todo-app/
├── frontend/               # React app (Vite)
│   ├── src/
│   │   ├── App.jsx         # Root component: currentUser state, session rehydration, auth handlers
│   │   ├── adapters/
│   │   │   ├── auth-adapters.js         # Fetch adapters for /api/auth/* endpoints
│   │   │   └── application-adapters.js  # Fetch adapters for /api/applications/* endpoints
│   │   └── components/
│   │       ├── AuthPage.jsx           # Login + Register forms (shown when logged out)
│   │       ├── ApplicationPage.jsx    # Main app container (shown when logged in)
│   │       ├── AddApplicationForm.jsx # Form to create a new job application
│   │       ├── ApplicationList.jsx    # Renders a list of ApplicationItems
│   │       └── ApplicationItem.jsx    # Single application: status dropdown, details, delete button
│   └── vite.config.js      # Proxies /api requests to Express in development
└── server/                 # Express + Postgres API
    ├── index.js            # App entry point, route definitions
    ├── controllers/
    │   ├── authControllers.js         # register, login, logout, getMe
    │   └── applicationControllers.js  # list, create, update, delete applications
    ├── models/
    │   ├── userModel.js         # SQL queries for the users table
    │   └── applicationModel.js  # SQL queries for the job_applications table
    ├── middleware/
    │   ├── checkAuthentication.js  # Blocks unauthenticated requests
    │   └── logRoutes.js            # Logs each incoming request
    └── db/
        ├── pool.js   # Postgres connection pool
        └── seed.js   # Creates tables and inserts sample data
```
