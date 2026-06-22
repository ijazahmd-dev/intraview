# Intraview 🎯

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Intraview** is a comprehensive, full-stack mock interview and skill-assessment platform. It connects candidates with expert interviewers, manages bookings, incorporates a robust token-based economy, and now includes AI-powered interview capabilities.

---

## 🚀 Key Features

### 👨‍🎓 Candidate Features
- **Browse & Discover**: View public profiles of verified interviewers and search by skills/roles.
- **Book Interviews**: Schedule sessions based on interviewer availability using a **Token-Locking** mechanism.
- **AI Mock Interviews**: Conduct role-based mock interviews with AI agents powered by LiveKit and Tavus avatars, receiving detailed feedback and evaluations via Gemini models.
- **Token Economy**: Purchase token packs via Stripe to book interviews. Tokens are locked on booking and refunded if canceled.
- **Subscriptions**: Subscribe to premium plans (Free / Starter / Pro) for monthly token grants and prioritized access.
- **Dashboard & Wallets**: Track past/upcoming interviews, wallet balances (available vs. locked), and full transaction history.

### 👔 Interviewer Features
- **Onboarding & Verification**: Seamless onboarding workflow (Profile Setup -> Availability Setup -> Verification).
- **Interviewer Subscriptions**: Required to go public, accept bookings, and appear in search results.
- **Availability Management**: Set one-time or recurring weekly availability slots.
- **Session Management**: View upcoming/completed sessions. Cancel bookings with mandatory reasoning (refunds candidate).
- **Earnings & Payouts**: Mark sessions as completed to transfer locked tokens to the interviewer wallet. Track earnings and request payouts.

### 🛡️ Admin Features
- **User Management**: Monitor and manage all candidates and interviewers.
- **Subscription & Token Management**: Full CRUD operations for token packs and candidate/interviewer subscription plans.
- **Platform Monitoring**: Monitor all platform bookings, payouts, and flagged issues.
- **Payout Queue**: Process withdrawal requests from interviewers.

---

## ⚙️ Architecture & Tech Stack

### Backend (Django)
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: PostgreSQL
- **Caching & Async Tasks**: Redis + Celery (for background jobs like sending OTPs, reminders, and webhook processing)
- **Authentication**: Custom JWT Cookie Auth with strict role-based access control (RBAC).
- **Payments**: Stripe API with Webhook routing.
- **Real-Time Video**: ZEGOCLOUD (for P2P video) & LiveKit (for AI Agent WebRTC infrastructure).
- **AI Integrations**: Google Gemini API (for NLP/evaluation), Tavus API (for AI Avatars).
- **Notifications**: Novu for real-time notifications via WebSockets.

### Frontend (React)
- **Framework**: React.js powered by Vite
- **State Management**: Redux Toolkit (with unified auth slices)
- **Styling**: Tailwind CSS & Lucide Icons
- **Routing**: React Router DOM (with protected route wrappers based on roles)
- **HTTP Client**: Axios with global interceptors for automatic token refresh

---

## 💳 Payment & Token System (The Economy)

Intraview operates on a robust token-based economy enforced strictly by `transaction.atomic()` blocks and row-level locking (`select_for_update()`).

1. **Purchasing**: Candidates purchase Token Packs via Stripe Checkout.
2. **Booking (Locking)**: When a candidate books an interview, the required tokens are deducted from `balance` and moved to `locked_balance`.
3. **Completion (Transfer)**: Once the interviewer marks the session completed, the locked tokens are formally transferred to the interviewer's wallet.
4. **Cancellation (Refund)**: If either party cancels before the session, the locked tokens are unlocked and refunded to the candidate's available balance.

---

## 🛠️ Environment Variables Configuration

To run the project locally, you need to configure the `.env` files for both the frontend and backend.

### Backend (`intraview/.env`)
Create a `.env` file in the `intraview/` directory. Here are the required keys:

```env
# Django Settings
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SECRET_KEY=your_django_secret_key
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
POSTGRES_DB=intraview_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgres://postgres:postgres@db:5432/intraview_db

# Redis & Celery
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379
CELERY_BROKER_URL=redis://redis:6379/1

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# OAuth & Integrations
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Real-time Video & Notifications
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret
ZEGO_TOKEN_EXPIRY_SECONDS=3600
ZEGO_EARLY_JOIN_MINUTES=5
NOVU_SECRET_KEY=your_novu_secret

# LiveKit & AI Interviews
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
BACKEND_AGENT_SHARED_SECRET=your_shared_secret

# Google Gemini (AI Feedback & Evaluation)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EVALUATION_MODEL=gemini-1.5-flash
GEMINI_FINAL_REPORT_MODEL=gemini-1.5-pro

# Tavus (AI Avatars)
TAVUS_API_KEY=your_tavus_api_key
TAVUS_AVATAR_ENABLED=true
TAVUS_REPLICA_ID=your_replica_id
TAVUS_PERSONA_ID=your_persona_id
TAVUS_AVATAR_PARTICIPANT_IDENTITY=tavus-avatar-agent
TAVUS_AVATAR_PARTICIPANT_NAME=AI Interviewer
```

### Frontend (`Intraview-frontend/.env`)
Create a `.env` file in the `Intraview-frontend/` directory.

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 💻 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/ijazahmed5432100/intraview.git
cd intraview
```

### 2. Setup Environment Variables
Populate the `.env` files in both the `intraview/` and `Intraview-frontend/` directories using the templates provided above.

### 3. Run with Docker Compose (Recommended)
The easiest way to run the entire backend infrastructure (Django, PostgreSQL DB, Redis, Celery Workers, Celery Beat) is via Docker Compose.

```bash
# Build and start all backend services
docker compose up --build
```

### 4. Run the Frontend
In a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite dev server.

```bash
cd Intraview-frontend
npm install
npm run dev
```

### 5. Stripe Webhooks (Local Testing)
To test payments locally, you must run the Stripe CLI to forward webhook events to your local Django server:

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook/stripe/
```
*(Copy the webhook secret printed in the console and put it in your `.env` under `STRIPE_WEBHOOK_SECRET`)*

---

*Built with ❤️ for aspiring engineers.*
