# AttendX — Attendance Management System

A full-stack, production-ready Attendance Management System built with a decoupled architecture: a **React** frontend consuming a **Laravel** REST API, backed by **MySQL**.

The system handles attendance tracking, leave management, task assignment workflows, role-based access control, reporting, attendance grading, and WhatsApp notifications — for both employees and administrators.

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- CKEditor 5 (task descriptions)
- React Context API (auth & toast state)
- Recharts (dashboard charts)
- Lucide React (icons)

**Backend**
- PHP Laravel
- Laravel Sanctum (token-based API authentication)
- Laravel Eloquent ORM
- Laravel Form Requests (validation)
- Laravel Queues (WhatsApp notification jobs)
- Laravel Policies-style permission middleware (custom RBAC)
- barryvdh/laravel-dompdf (PDF report export)
- maatwebsite/excel (Excel/CSV report export)

**Database**
- MySQL

**File Storage**
- Laravel Storage (`public` disk) for profile pictures

**Notifications**
- WhatsApp notifications via a swappable service layer (Meta Cloud API / Twilio ready), dispatched through Laravel Jobs & Queues. Ships with a `log` driver by default so the system runs fully without external credentials.

---

## Project Structure

```
Attendance Management System/
├── backend/     → Laravel REST API
├── frontend/    → React application
└── README.md
```

The frontend and backend are fully decoupled and communicate exclusively over REST APIs (`/api/*`). No Blade views are used for application UI.

---

## Features

### Authentication
- Registration (name, email, phone, password, optional profile picture)
- Login / Logout (Sanctum token-based)
- Forgot Password / Reset Password
- Encrypted passwords, protected routes on both frontend and backend

### Employee Panel
- **Dashboard** — present/absent/leave day counts, attendance grade, task summary, recent activity, leave status overview
- **Attendance** — mark attendance once per day; duplicate marking blocked at both the application and database level; cannot be edited or deleted by the employee
- **Leave** — apply for leave (type, date range, reason), view status and admin comments, overlapping leave requests blocked
- **Attendance History** — filterable by date, month, and year
- **Tasks** — view assigned tasks (CKEditor-rendered descriptions), submit responses, view admin feedback, resubmit on rejection
- **Profile** — update name, phone, email, profile picture, and password

### Admin Panel
- **Dashboard** — team-wide stats, 7-day attendance trend chart, grade distribution chart
- **User Management** — view, add, edit, delete, search, and filter users
- **Attendance Management** — view, add, edit, delete, search, and filter attendance records for any user
- **Leave Management** — view, approve, or reject leave requests with comments; search and filter
- **Task Management** — assign tasks (with CKEditor rich-text descriptions, due date, priority, assignee), review submissions, approve/reject with feedback
- **Reports** — individual and complete system attendance reports with present/absent/leave counts, percentage, and grade; export to PDF, Excel, or CSV
- **Attendance Grading** — configure the present-day thresholds used to calculate grades (A–F); grades recalculate automatically
- **Roles & Permissions** — create custom roles, assign granular permissions per module (attendance, leave, tasks, reports, users, roles), assign roles to users

### Notifications
WhatsApp notifications are dispatched via queued jobs for:
- Attendance marked
- Leave submitted (to admins), approved, rejected
- Task assigned, approved, rejected

### Security
- Sanctum token-based authentication
- Role-based access control with granular, database-driven permissions
- Form Request validation on every endpoint (frontend + backend)
- Password hashing (bcrypt)
- CORS configuration restricting frontend origin
- Duplicate-prevention constraints at the database level (unique attendance per user/day)

---

## Prerequisites

- Node.js (LTS) & npm
- PHP 8.2+
- Composer
- MySQL 8+
- PHP `gd` extension enabled (required for Excel export)

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Attendance Management System"
```

### 2. Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendance_management
DB_USERNAME=root
DB_PASSWORD=

WHATSAPP_DRIVER=log
QUEUE_CONNECTION=database
```

Create the database, then run migrations and seeders:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

Start the API server:

```bash
php artisan serve
```

Start the queue worker (required for WhatsApp notification jobs — run in a separate terminal):

```bash
php artisan queue:work
```

**Default admin account** (created by the seeder):
- Email: `admin@attendx.com`
- Password: `Admin@123`

> ⚠️ Change this password after first login.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Enabling Real WhatsApp Notifications

By default, `WHATSAPP_DRIVER=log` writes outgoing messages to `storage/logs/laravel.log` instead of sending them, so the system runs end-to-end without any external account. To send real messages, set up either provider in `backend/.env`:

**Meta WhatsApp Cloud API**
```env
WHATSAPP_DRIVER=meta
WHATSAPP_META_TOKEN=your-token
WHATSAPP_META_PHONE_ID=your-phone-id
```

**Twilio**
```env
WHATSAPP_DRIVER=twilio
WHATSAPP_TWILIO_SID=your-sid
WHATSAPP_TWILIO_TOKEN=your-token
WHATSAPP_TWILIO_FROM=whatsapp:+14155238886
```

No application code changes are needed — `app/Services/WhatsAppService.php` routes to the configured driver automatically.

---

## Role & Permission System

Roles are stored in the database and can be created or edited from **Admin → Roles & Permissions**. The system ships with four default roles: `admin`, `student`, `teacher`, `hr`. The `admin` role always has full access; other roles are granted specific permissions (e.g. `attendance.mark`, `leave.approve`, `reports.export`) which are enforced by a `permission` middleware on protected API routes.

---

## License

This project was built as a custom application and is not licensed for public redistribution.