# CineVault 🎬🎟️

**CineVault** is a full-stack movie theatre ticket booking and operations management platform. Built for real-time seat synchronization, secure Razorpay checkout workflows, and role-based administrative analytics, CineVault delivers a complete cinema experience from seat selection to revenue tracking.

---

## ✨ Key Features

### 👤 User Experience
* **Interactive Seat Mapping:** Real-time seat selection with distinct pricing tiers (VIP Recliners, Club, Executive) and atomic seat locking.
* **Payment Integration:** Seamless checkout powered by Razorpay with dedicated success (`/bookings/success`) and failure (`/bookings/failure`) confirmation flows.
* **User Profile & Ticket Logs:** Paginated booking history, detailed digital ticket receipts, and secure profile/password management with live toast feedback.

### 🛡️ Admin Ops Console (`/admin`)
* **Role-Based Route Protection:** Dedicated route guards (`ProtectedAdminRoute`) restricting access strictly to authenticated `ADMIN` accounts.
* **Live Analytics Dashboard:** Gross revenue tracking, occupancy percentages, screen status monitoring, and Today vs. All-Time top-performing movie leaderboards.
* **Showtimes & Screen Management:** Tools for scheduling movie showtimes and configuring auditorium layouts.
* **Error Resilience:** Custom router error boundaries (`ErrorPage`) and API fallback handlers ensuring graceful degradation during network interruptions.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, React Router (Data Router), Axios, Lucide Icons, React Hot Toast
* **Backend:** Node.js, Express.js, TypeScript / ES Modules, Zod (Request Validation), JWT & Bcrypt
* **Database & Caching:** MongoDB (Mongoose with multi-document transactions), Redis (Atomic seat locking via Lua scripts)
* **Payments:** Razorpay API

---

## 📂 Monorepo Structure

```text
CineVault/
├── backend/
│   ├── config/          # Database, Redis & Razorpay configurations
│   ├── controllers/     # Business logic, payments & analytics aggregations
│   ├── middlewares/     # JWT auth, role verification & error handlers
│   ├── models/          # Mongoose schemas (User, Movie, Screen, Show, Booking)
│   ├── routes/          # Express API endpoints
│   ├── .env.example     # Environment variable template
│   └── server.js        # Application entry point
├── frontend/
│   ├── src/
│   │   ├── apis/        # Modular Axios API service functions
│   │   ├── components/  # Reusable UI components & ProtectedAdminRoute
│   │   ├── context/     # AuthContext state provider
│   │   ├── layouts/     # Public RootLayout & AdminLayout
│   │   ├── pages/       # Home, SeatSelection, UserProfile, ErrorPage & Admin views
│   │   └── App.jsx      # Data router configuration
│   ├── .env.example     # Frontend environment template
│   └── package.json
└── README.md