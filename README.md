# Synnex Technology

A polished, responsive React/Vite website for Synnex Technology, an electrical engineering business based in Colombo, Sri Lanka. The project includes a Laravel-compatible API scaffold and PostgreSQL migration for contact enquiries.

## Project structure

```
synnex technology/
├── frontend/   React + Vite website (src/, public/, index.html, vite.config.js)
├── backend/    Laravel 11 API (SQLite by default)
├── docs/       Planning notes and reports
└── _archive/   Old PostgreSQL scaffold, kept for reference only (not used)
```

## Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend runs on port 3001. The contact form and the account/portal pages talk to the
Laravel API in `backend/`. Point the frontend at a different API with
`VITE_API_URL` (defaults to `http://127.0.0.1:8000/api`).

## Backend

`backend/` is a Laravel 11 application (SQLite by default for local development).
Run it separately from the frontend:

```bash
cd backend
php artisan migrate
php artisan serve
```

Endpoints:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/contact-submissions` (public; linked to the signed-in user when a bearer token is sent)
- `GET /api/my/enquiries` (authenticated)

To email enquiries to a real inbox, set `MAIL_MAILER`, the SMTP credentials and
`MAIL_OWNER_ADDRESS` in `backend/.env`. With `MAIL_MAILER=log` the message is
written to `backend/storage/logs/laravel.log` instead of being sent.

## Private owner dashboard

`/admin` is a separate, hidden dashboard showing account totals, sign-in counts and every
contact enquiry. It is **not linked in the public navigation** and the API returns 403 for
non-admin accounts.

1. Register your own account normally at `/register`.
2. Promote it once from the backend:

   ```bash
   cd backend
   php artisan admin:promote you@example.com
   ```

3. Log in and open `http://127.0.0.1:3001/admin` (an "Owner dashboard" button also appears
   on your portal page, but only for admin accounts).

## Content replacements

Business details are currently set to Synnex Technology, K. Arulalagan, Colombo, `0777588128`, `vkarull@gmail.com`, and Monday–Friday 10:00 AM–6:00 PM. Services use the seven approved defaults from the brief. Replace the placeholder cards in the Projects section with supplied photos and update the LocalBusiness JSON-LD if a street address is later provided.
