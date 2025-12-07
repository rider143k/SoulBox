<!-- Copilot instructions for SoulBox repo -->
# SoulBox — Copilot Instructions

These instructions give an AI coding agent focused, actionable guidance for working in this repository.

- Project shape: monorepo-like split with a Node/Express backend in `backend/` and a Create React App frontend in `frontend/`.

- Key services and boundaries:
  - `backend/` (Express + MySQL): handles auth, capsule CRUD, file uploads, scheduled unlocks/reminders, email sending.
    - Main entry: `backend/server.js` (also contains the cron job that runs every minute).
    - DB pool: `backend/db.js` exports a `mysql2` promise pool — queries return `[rows, fields]` and are awaited.
    - Routes: `backend/routes/*.js` provide the HTTP API under `/api/*` (mounted in `server.js`). Important routes:
      - `/api/auth` — login/signup (see `backend/routes/auth.js`). Expects JSON bodies.
      - `/api/capsule` — capsule create/view/unlock/delete endpoints (see `backend/routes/capsule.js`).
      - `/api/certificate` — certificate endpoints (exists in `routes/`).
    - Auth: `backend/middleware/auth.js` expects `Authorization: Bearer <token>` and sets `req.userId`.
    - Uploads: `uploads/` served statically by Express at `/uploads`. Multer config is in `backend/routes/capsule.js`.
    - Email: `backend/services/emailService.js` uses `backend/utils/mailer.js` which wraps `nodemailer`.

- Frontend:
  - CRA app in `frontend/` with scripts in `frontend/package.json` (`start`, `build`, `test`).
  - API client: `frontend/src/utils/api.js` sets `baseURL` to `http://localhost:5000/api` and attaches the token from `localStorage` to `Authorization` headers.
  - Auth helpers: `frontend/src/utils/auth.js` uses `localStorage` for token storage and simple redirect for logout.
  - Pages/components live under `frontend/src/pages` and `frontend/src/components` (examples: `CreateCapsule.jsx`, `ViewCapsule.jsx`).

- Environment variables (must be present to run backend):
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` (see `backend/db.js`).
  - `JWT_SECRET`, `JWT_EXPIRES` (auth tokens used in `middleware/auth.js` and `routes/auth.js`).
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (nodemailer config in `utils/mailer.js`).
  - `BASE_URL` — used when building links inside emails (`services/emailService.js`).

- Important runtime behaviors and gotchas:
  - The cron job is implemented inside `server.js` and runs every minute (`cron.schedule('* * * * *', ...)`). It performs DB queries, flips `is_unlocked`, inserts reminders, and calls the email service — be careful when modifying (avoid accidentally sending duplicate emails).
  - DB queries use `mysql2` promise pool: calling `await db.query(...)` returns an array; extract rows with `const [rows] = await db.query(...)`.
  - File uploads are stored under a local `uploads/` directory; uploaded file paths are saved with a leading `/uploads/` prefix — front-end expects to fetch media at that path.
  - The backend package has no `start` script. To run backend locally: `cd backend; npm install; node server.js` (or use `nodemon server.js` during development).
  - Frontend runs via CRA: `cd frontend; npm install; npm start`.

- API examples (concrete):
  - Login (returns `token`):
    - POST `http://localhost:5000/api/auth/login` with JSON `{ "email": "...", "password": "..." }`.
  - Create capsule (requires auth token + multipart file):
    - POST `http://localhost:5000/api/capsule/create` with `Authorization: Bearer <token>` and form fields `title`, `message`, `unlock_date`, `unlock_time`, `recipient_email` and optionally `file` (multipart/form-data). See `backend/routes/capsule.js` for accepted file types and 50MB limit.
  - Unlock capsule (by share token):
    - POST `http://localhost:5000/api/capsule/unlock/:token` with JSON `{ "key": "ENCRYPTKEY", "viewer_email": "..." }`.

- Coding patterns to follow when editing existing code:
  - Use async/await with `db.query` and destructure result as `[rows]`.
  - Use `console.log`, `console.warn`, and `console.error` consistently — existing code relies on these messages for runtime visibility.
  - When adding endpoints that send email, prefer `EmailService` (`backend/services/emailService.js`) and `utils/mailer.sendMail` rather than constructing new transporters.
  - Respect the existing token-based auth: attach `req.userId` and perform authorization checks in route handlers.

- Files to reference when implementing or changing behavior:
  - `backend/server.js` — cron, route mounts, static uploads, and health-check (`/health`).
  - `backend/db.js` — connection/pool details.
  - `backend/routes/capsule.js` — upload handling, file filters, time conversion util `convertTo24Hour`, `getMediaFiles` helper.
  - `backend/middleware/auth.js` — token verification pattern and error responses.
  - `frontend/src/utils/api.js` — API client and header injection pattern.

- When in doubt, run these quick checks locally:
  - Backend health: `curl http://localhost:5000/health` should return JSON including `status: 'OK'`.
  - SMTP readiness: `backend/utils/mailer.js` calls `transporter.verify()` at startup and logs readiness or errors.

If any parts are unclear or you want more examples (e.g. a sample `curl` for multipart upload or recommended `npm` scripts to add), tell me which section to expand or adjust.
