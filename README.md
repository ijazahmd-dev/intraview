# Intraview 🎯  
A Full-Stack Mock Interview & Skill Assessment Platform (React + Django REST Framework)

## 📌 Project Overview
**Intraview** is a mock interview and skill-assessment platform designed to help candidates prepare for real interviews through structured interview bookings, token-based payments, subscription features, and interviewer onboarding workflows.

The platform supports **three major roles**:

- **Candidate** → Book interview sessions, manage tokens, subscriptions, dashboard, and interview history  
- **Interviewer** → Onboarding, availability setup, accept/cancel sessions, earnings, dashboards  
- **Admin** → Manage interviewers, bookings, subscription plans, token packs, and revenue monitoring  

This project follows a scalable architecture with proper separation of concerns using:
- **Django REST Framework APIs**
- **Role-based authentication & permissions**
- **Token wallet system**
- **Stripe Checkout integration**
- **Atomic booking + token locking transactions**

---

## 🚀 Key Features

## ✅ Candidate Features
- Browse available interviewers
- View interviewer profile & details
- Discover interview slots based on interviewer availability
- Book interview sessions with **token locking**
- Cancel booking (with reason) → **tokens unlocked**
- View Upcoming Interviews & Past Interviews
- Purchase token packs (Stripe checkout)
- Subscription plans (Free / Starter / Pro)
- Candidate wallet dashboard:
  - balance
  - locked balance
  - transaction history
  - token spending summary

---

## ✅ Interviewer Features
- Interviewer onboarding flow:
  - Profile setup
  - Availability setup (Recurring / One-time)
  - Verification submission
- Subscription required to go public & accept bookings
- Manage availability blocks (set, list, delete, recurring)
- Interviewer dashboard:
  - Upcoming sessions list
  - Completed sessions list
  - Tokens earned summary
- Cancel confirmed booking (with reason) → candidate tokens refunded
- Mark session completed → **locked tokens transferred to interviewer wallet**
- Interviewer wallet dashboard:
  - earnings transactions
  - token history

---

## ✅ Admin Features
- Manage user subscription plans (CRUD + soft delete)
- Manage interviewer subscription plans (CRUD + soft delete)
- View and manage platform bookings
- Booking detail API for admin monitoring
- Revenue intelligence & future hooks for penalties/refunds (planned)

---

## ✅ Subscription & Token System

### 🔹 Subscription Plans (Candidate)
Candidate subscription plans can include:
- monthly free token grants
- AI interviews quota (schema ready)
- feature flags (priority booking, advanced AI feedback)

**Active subscription access is enforced using `SubscriptionEntitlementService`.**

### 🔹 Interviewer Subscription Plans
Interviewers must maintain an active interviewer subscription to:
- make profile public
- accept bookings
- appear in candidate search

**Active interviewer subscription is enforced using `InterviewerEntitlementService`.**

### 🔹 Token Wallet (Core System)
Each user has a wallet with:
- `balance`
- `locked_balance`

When a candidate books a session:
✅ tokens are **locked**  
When cancelled:
✅ tokens are **unlocked**  
When completed:
✅ locked tokens are **transferred** to interviewer  

All operations are implemented with:
- `transaction.atomic()`
- row-level locks using `select_for_update()`

---

## 💳 Stripe Payments (Token Packs + Subscriptions)
Stripe Checkout is integrated for:
✅ Candidate subscription purchase  
✅ Token pack purchases  
✅ Webhook-based activation flow  

Stripe Webhook triggers:
- Subscription activation
- Monthly token grant idempotent credits

---

## 🧠 AI Readiness (Planned Feature)
AI interview feature is **not implemented yet**, only schema hooks are prepared:
- `monthly_ai_used`
- plan-based `ai_quota`

🚫 No AI logic implemented yet  
🚫 No AI token deductions implemented yet  

---

## 🛠 Tech Stack

### Backend
- **Django**
- **Django REST Framework**
- PostgreSQL (recommended)
- Stripe API
- JWT Cookie Auth (Custom Authentication classes)
- Transaction-safe booking logic

### Frontend
- **React (Vite)**
- Redux Toolkit (state management)
- Axios (API calls)
- TailwindCSS (UI styling)

---

## 📂 Backend Modules / Apps
- `authentication` → custom user model, JWT cookie auth, role permissions
- `interviewers` → interviewer onboarding, profile, availability, verification
- `bookings` → booking creation, lifecycle, dashboards, details
- `wallet` → token wallet, transactions, lock/unlock/transfer logic
- `subscriptions` → candidate subscription plans + entitlement gating
- `interviewer_subscriptions` → interviewer plan & subscription gating
- `payments` → Stripe checkout + webhook handling

---

## 🔐 Authentication & Permissions
The project supports role-based secure access:

- Candidate APIs protected by `CookieJWTAuthentication`
- Interviewer APIs protected by `InterviewerCookieJWTAuthentication`
- Role permissions include:
  - `IsActiveInterviewer`
  - onboarding restrictions
  - verified-only visibility checks

---

## 🔄 Booking Lifecycle (Phase 4)

### ✅ Booking Creation (Atomic + Token Locking)
1. Candidate selects availability slot
2. System checks:
   - slot active
   - remaining capacity
   - interviewer eligible (subscription + profile public + accepting bookings)
   - candidate token balance
3. In atomic block:
   - lock availability
   - lock wallet
   - lock tokens
   - create booking as CONFIRMED

---

### ✅ Cancel Booking
Candidate can cancel booking by providing a reason:
- booking must be confirmed
- booking must not have started
- tokens unlocked back to candidate

Interviewer can also cancel booking with reason:
- candidate tokens refunded
- booking marked as cancelled by interviewer

---

### ✅ Complete Booking
Interviewer completes booking after session end:
- candidate locked tokens transferred
- interviewer receives token earnings
- booking marked COMPLETED

---

## 📌 API Highlights

### Candidate Side
- List available interviewers
- Interviewer detail view
- Slot discovery by interviewer & date
- Create booking
- Upcoming bookings
- Past bookings
- Booking detail
- Cancel booking
- Wallet info + transaction history

### Interviewer Side
- Availability create/list/delete
- Upcoming sessions
- Completed sessions history
- Cancel booking with reason
- Mark booking completed
- Wallet earnings overview

### Admin Side
- Subscription plan management (CRUD)
- Interviewer plan management (CRUD)
- Booking listing + booking detail API

---

## ✅ Setup Instructions

### 1) Clone Repo
```bash
git clone https://github.com/<your-username>/intraview.git
cd intraview
