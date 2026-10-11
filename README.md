# Student Hub — Frontend

The frontend for Student Hub, a student companion app covering academics, admin, and social features.

This repository is the early-stage UI: static pages with shared CSS, building toward a connected app.

## Status

Early development. What exists today:

- Login page (styled, responsive)
- Signup page (styled, responsive)
- Shared stylesheet with mobile-first tuning

Not yet wired:

- Forms do not submit anywhere (backend integration is next)
- No JavaScript interactivity yet

## Tech stack

Plain HTML, CSS, and (soon) JavaScript. No frameworks yet — the plan is to build real DOM and event fluency before reaching for React.

## Project layout

    student-hub-frontend/
    ├── login.html
    ├── signup.html
    └── css/
        └── style.css

## Running locally

Open `login.html` in a browser, or use any static server:

    python3 -m http.server 5500

Then visit http://127.0.0.1:5500/login.html

## Roadmap

1. Login and signup pages (done)
2. Wire signup form to the backend
3. Wire login (after JWT support lands in the backend)
4. Announcements page
5. Dashboard shell with navigation

## About

Built as part of a self-directed journey into software and robotics engineering.
