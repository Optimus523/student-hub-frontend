# Student Hub Frontend

Student Hub is a student-focused web application designed to centralize academic, administrative, and social tasks in one place. This repository contains the frontend UI for the platform, built as a responsive static web app with modern styling and interactive JavaScript.

The current implementation is a working frontend that connects to a live FastAPI backend for authentication, announcements, assignments, and profile management.

## Project overview

Student Hub aims to help students manage their daily academic life from a single dashboard, including:

- Checking announcements and updates
- Viewing and adding assignments with due dates
- Tracking fees and administrative information
- Managing a personal profile and avatar
- Accessing quick academic resources and study-related functions
- Seeing a simplified campus dashboard tailored to student use

## Current status

This frontend is actively developed and currently includes:

- `login.html` — login page with responsive layout, form validation, JWT storage, and loading overlay
- `signup.html` — signup page with password confirmation and API submission
- `home.html` — dashboard with stat cards, live announcements preview, live deadlines, and fee summary
- `announcements.html` — full announcements feed with create form and author-only delete
- `assignments.html` — full assignments feed with create form, due-date sorting, status pills, and author-only delete
- `profile.html` — profile management: change username, change password, upload avatar
- `coming-soon.html` — shared placeholder page for unbuilt features (reads `?feature=` from URL)
- `css/styles.css` — shared UI styling for auth pages and form states
- `css/dashboard.css` — dashboard, list, pill, avatar, and profile styling (also drives mobile sidebar)
- `js/login.js` — login handling, JWT storage, success redirect
- `js/signup.js` — signup validation and API submission
- `js/dashboard.js` — auth guard, sidebar toggle, logout, announcements and assignments fetching, avatar rendering
- `js/profile.js` — profile load/update, password change, avatar upload

## Features already included

### Authentication

- Clean student portal branding
- Responsive sign-in and sign-up screens
- Client-side validation for required fields
- Password confirmation on signup
- Success and error message display states
- Full-screen loading overlay during login
- JWT stored in `localStorage`
- Auth guard on protected pages (redirects to `login.html` if no token)
- Logout that clears all stored auth state

### Dashboard shell

- Fixed sidebar navigation layout
- Live stat cards: "Due this week" (from assignments) and "Total announcements"
- Timetable card (placeholder, real data coming)
- Announcements preview (last 3 from backend)
- Deadlines preview (next 2 from backend, sorted by due date)
- Fees summary (placeholder)
- Mobile-friendly sidebar toggle with overlay

### Announcements

- Full feed at `announcements.html`
- Create form with title and body
- Author-only delete button (`403`-protected on backend)
- Relative timestamps ("Just now", "2h ago", "3d ago")
- Author username and timestamp on each post

### Assignments

- Full feed at `assignments.html`
- Create form with title, description, course code, and due date (`datetime-local`)
- Author-only delete
- Status pills computed client-side: **Overdue**, **Due today**, **Due soon** (within 72h)
- Sorted by `due_date` ascending (backend)
- Author username shown

### Profile

- View current user ID and username
- Change username (unique, 3–30 chars)
- Change password (requires current password, 8–128 chars)
- Upload avatar (JPEG/PNG/WebP, max 2 MB)
- Avatar displays in sidebar across all pages
- Letter fallback when no avatar is set

### Coming Soon

- Every sidebar link without a real page points to `coming-soon.html?feature=X`
- Page reads the query string and shows the correct icon, title, and message
- Covers: Timetable, Materials, Grades, Fees, Registration, Messages, Study Groups, Voice Rooms

### UX and styling

- Modern palette built around indigo and neutral tones
- Consistent card, pill, and date-block components
- Responsive grids (auto-fit) and mobile sidebar
- Keyboard focus states on form inputs
- Error styling for validation feedback
- Loading states on form submission
- Empty states for lists with no data

## Tech stack

- HTML5
- CSS3
- JavaScript (vanilla ES6+)
- No framework, no build step

The frontend is intentionally lightweight and static so it stays fast and easy to iterate.

## Project structure

    student-hub-frontend/
    ├── README.md
    ├── home.html
    ├── login.html
    ├── signup.html
    ├── announcements.html
    ├── assignments.html
    ├── profile.html
    ├── coming-soon.html
    ├── css/
    │   ├── styles.css
    │   └── dashboard.css
    ├── js/
    │   ├── login.js
    │   ├── signup.js
    │   ├── dashboard.js
    │   └── profile.js
    ├── .gitignore
    └── .git/

## Page details

### Login page

File: `login.html`

Purpose:

- Allows existing users to sign in
- Validates username and password before submission
- Shows a full-screen overlay spinner during the request
- Redirects to `home.html` on success

Behavior:

- `js/login.js` checks if the page loads after a successful signup (`?signup=success`) and shows a banner
- Sends form-encoded `POST` to `/login/` (OAuth2 password flow — **not** JSON)
- Stores `access_token`, `token_type`, `user_id`, and `username` in `localStorage`
- Handles `401` (invalid credentials) and network errors

### Signup page

File: `signup.html`

Purpose:

- Creates a new student account
- Validates matching passwords
- Sends the request to the backend

Behavior:

- `js/signup.js` sends JSON `POST` to `/users/`
- Handles duplicate username conflicts (`409`)
- Redirects to `login.html?signup=success`

### Dashboard / home page

File: `home.html`

Purpose:

- Serves as the student landing dashboard
- Live announcements and assignments previews

Included cards:

- **Stat cards** — Due this week (from assignments), Total announcements, Enrolled courses (placeholder), Mid-semester tests (placeholder)
- **Timetable** — placeholder
- **Announcements** — top 3 from backend, "View all →" to `announcements.html`
- **Deadlines** — next 2 assignments by due date, "View all →" to `assignments.html`
- **Fees** — placeholder

### Announcements page

File: `announcements.html`

- Create form at the top
- Full feed below, newest first
- Author-only delete (backend enforces `403`)
- Shows author username and relative time

### Assignments page

File: `assignments.html`

- Create form with title, description, course code, and `datetime-local` due date
- Full feed sorted by due date
- Status pills: Overdue, Due today, Due soon
- Author-only delete

### Profile page

File: `profile.html`

- Account card showing user ID and username
- Avatar section: preview, "Choose picture" button, hidden file input
- Username form (PATCH `/users/me`)
- Password form (current + new + confirm)
- Success/error messages

### Coming soon page

File: `coming-soon.html`

- Placeholder for unbuilt features
- Reads `?feature=` from the URL and displays the correct icon, title, and message
- Falls back to generic "Coming Soon" if the feature isn't mapped

## Backend integration

The frontend talks to the Student Hub FastAPI backend. The backend base URL is computed at runtime:

    http://${window.location.hostname}:8000

This means:

- Both frontend and backend must run on the **same hostname** (`127.0.0.1` or `localhost` — not one of each)
- Backend CORS must allow the frontend origin (already configured for `127.0.0.1:5500`)

### Endpoints consumed

| Feature                  | Method | Path                           |
| ------------------------ | ------ | ------------------------------ |
| Login                    | POST   | `/login/` (form-encoded)       |
| Signup                   | POST   | `/users/` (JSON)               |
| Current user             | GET    | `/users/me`                    |
| Update username/password | PATCH  | `/users/me`                    |
| Upload avatar            | POST   | `/users/me/avatar` (multipart) |
| List announcements       | GET    | `/announcements/`              |
| Create announcement      | POST   | `/announcements/`              |
| Delete announcement      | DELETE | `/announcements/{id}`          |
| List assignments         | GET    | `/assignments/`                |
| Create assignment        | POST   | `/assignments/`                |
| Delete assignment        | DELETE | `/assignments/{id}`            |

## Local development

### 1. Clone the repository

    git clone https://github.com/Optimus523/student-hub-frontend.git
    cd student-hub-frontend

### 2. Start a local static server

From the project root:

    python3 -m http.server 5500

Then open any of these pages:

- `http://127.0.0.1:5500/login.html`
- `http://127.0.0.1:5500/signup.html`
- `http://127.0.0.1:5500/home.html`

### 3. Run the backend

The frontend expects the backend at `http://127.0.0.1:8000`. See the backend repo for setup instructions.

**Important:** open the frontend using `127.0.0.1:5500`, not `localhost:5500`. The backend CORS config and the API base URL are both tied to the hostname you use in the browser.

## Known limitations

- **Timetable** and **Fees** cards on the dashboard show static placeholder data — the backend doesn't yet have models for them
- **Enrolled courses** and **Mid-semester tests** stat cards are hardcoded
- No pagination — announcements and assignments load everything at once
- No search or filtering
- All users can create announcements and assignments (no admin role yet)
- No frontend-side token expiry check — the app relies on backend `401`s to detect an expired session

## Roadmap

Planned future work:

- Timetable module (backend + frontend)
- Grades module
- Admin role: restrict creation/deletion to admins
- Pagination and filtering for lists
- Search across announcements and assignments
- Dark mode
- Push notifications for new announcements

## License

This project is currently intended for personal, learning, and portfolio use unless otherwise specified by the project owner.

## Contributing

This repo is still under active development, so contributions are welcome if the project direction and implementation approach align with the goals of the platform.

If you are working on the project locally, make sure to keep your `.env` and `venv/` out of version control (they live in the backend repo) and push only the frontend code.
