# Student Hub Frontend

Student Hub is a student-focused web application designed to centralize academic, administrative, and social tasks in one place. This repository contains the frontend UI for the platform, built as a responsive static web app with modern styling and interactive JavaScript.

The current implementation acts as a working frontend prototype for:

- Sign-in experience
- Sign-up flow with validation
- Dashboard/home screen with sidebar navigation
- Student-focused summary cards for timetable, announcements, deadlines, and fees

This project is intended to work alongside a backend API for authentication and data persistence.

## Project overview

Student Hub aims to help students manage their daily academic life from a single dashboard, including:

- Checking announcements and updates
- Viewing class schedules and deadlines
- Tracking fees and administrative information
- Accessing quick academic resources and study-related functions
- Seeing a simplified campus dashboard tailored to student use

## Current status

This frontend is in active development and currently includes the following implemented UI pieces:

- `login.html` — login page with responsive layout and form validation
- `signup.html` — signup page with password confirmation and network submission logic
- `home.html` — dashboard landing page with a responsive sidebar and summary cards
- `css/styles.css` — shared UI styling for auth pages and form states
- `css/dashboard.css` — dashboard-specific layout, card styling, and mobile sidebar behavior
- `js/login.js` — login redirect handling and sign-up success message flow
- `js/signup.js` — signup validation and API submission to the backend
- `js/dashboard.js` — mobile sidebar event handling and overlay behavior

## Features already included

### Authentication UI

- Clean student portal branding
- Responsive sign-in and sign-up screens
- Client-side validation for required fields
- Password confirmation on signup
- Success and error message display states
- Redirect flow after successful account creation

### Dashboard shell

- Fixed sidebar navigation layout
- Student dashboard landing page
- Cards for timetable, announcements, deadlines, and fees
- Mobile-friendly sidebar toggle
- Overlay for open/closed navigation state
- Scrollable navigation section on larger screens

### UX and styling

- Modern color palette built around indigo and neutral tones
- Responsive card and layout behavior
- Desktop and mobile-friendly layout adjustments
- Keyboard focus states for accessibility
- Error styling with visible validation feedback

## Tech stack

This frontend is built using:

- HTML5
- CSS3
- JavaScript (vanilla ES6+)
- No frontend framework yet

The project is intentionally lightweight and static so it can stay fast and easy to iterate while the app structure is being defined.

## Project structure

```text
student-hub-frontend/
├── README.md
├── home.html
├── login.html
├── signup.html
├── css/
│   ├── dashboard.css
│   └── styles.css
├── js/
│   ├── dashboard.js
│   ├── login.js
│   └── signup.js
├── .gitignore
└── .git/
```

## Page details

### Login page

File: `login.html`

Purpose:

- Allows existing users to sign in
- Displays a welcome screen for returning students
- Validates username and password fields before submission
- Redirects to the dashboard after successful user flow

Behavior:

- `js/login.js` checks if the page loads after a successful signup via the `?signup=success` query parameter
- A success message is displayed and the URL is cleaned up after the redirect flow

### Signup page

File: `signup.html`

Purpose:

- Creates a new student account
- Validates matching passwords
- Sends the request to a backend API

Behavior:

- `js/signup.js` listens for form submit events
- Confirms that both passwords match
- Sends a `POST` request to `http://<hostname>:8000/users/`
- Handles duplicate username conflicts with a friendly error message
- Redirects to the login page after account creation succeeds

### Dashboard / home page

File: `home.html`

Purpose:

- Serves as the student landing dashboard
- Provides a quick overview of the main student portal modules
- Helps visualize the structure of the application before full backend integration

Included cards:

- Timetable
- Announcements
- Deadlines
- Fees

## Local development

### 1. Clone the repository

```bash
git clone https://github.com/Optimus523/student-hub-frontend.git
cd student-hub-frontend
```

### 2. Start a local static server

From the project root, run:

```bash
python3 -m http.server 5500
```

Then open any of the following pages in your browser:

- `http://127.0.0.1:5500/login.html`
- `http://127.0.0.1:5500/signup.html`
- `http://127.0.0.1:5500/home.html`
