# 🌌 Addisu Yirdaw Deresse — Career Management Platform

An accessibility-first, highly dynamic, glassmorphic Personal Career Management Platform and Portfolio. Designed to support lifetime career scalability, it transitions from a static showcase into a fully-functional CMS-driven platform managing projects, timeline events, achievements, blogs, media files, and communications.

---

## 🌟 Key Features

*   **🎨 Glassmorphic Theme Engine:** Sleek, modern dark/light styling with responsive UI layouts, harmonic HSL colors, frosted panels, and interactive micro-animations.
*   **🛠️ Admin CMS Dashboard:** Secure administrative portal featuring data CRUD editors, site analytics charts, database backup/restore utilities, and custom email configuration settings.
*   **📑 Interactive Resume Builder:** Build, filter, and export customized CV templates by selecting specific skills, experiences, and projects dynamically.
*   **💼 Recruiter Dashboard:** Tailored workspace for prospective recruiters and hiring managers to quickly parse target achievements, download custom resumes, or send messages.
*   **📸 Masonry Media Gallery:** Built-in files manager supporting responsive grid layouts, folder categorization, lazy loading, and interactive full-screen lightbox sliders.
*   **🎖️ Premium Certificate Viewer:** Inline modal supporting image/PDF zoom-in, fullscreen mode, image downloading, sharing, and deep-linked bookmarkable route hashes.
*   **✍️ Extensible Blog Engine:** Clean markdown reading view with computed read times, share shortcuts, and smart related-articles panels.
*   **🤖 Floating AI Assistant:** Real-time conversational AI widget pre-loaded with portfolio context, enabling visitors to query experience history immediately.
*   **📨 Message Inbox & Email Dispatch:** Unified inbox to read, archive, and reply to client inquiries. Features automatic integration with **Resend** or **EmailJS** for instant email notification relays.

---

## 🛠️ Technology Stack

*   **Core:** React 19, TypeScript, Vite
*   **Styling:** Vanilla CSS Variables, Lucide Icons
*   **Database & Storage:** Supabase (PostgreSQL, Auth, RLS, Storage Buckets) with an optimized client-side **LocalStorage Mock Gateway** fallback
*   **Integrations:** Resend API / EmailJS REST API (Notifications & Outgoing Replies), local AI context query engine

---

## 📂 Project Architecture

The application adheres to **Clean Architecture** patterns, separating core business logic from framework layers:

```
src/
├── domain/                  # Enterprise Rules & Core logic
│   ├── entities/            # Domain objects (Project, Blog, Message, Profile...)
│   └── services/            # Pure functions (InputSanitizer, ResumeFormatter...)
├── application/             # Application Rules & Use Cases
│   └── ports/               # Repository and gateway interfaces (outwards adapters)
├── infrastructure/          # Frameworks and Drivers
│   ├── config/              # Database clients (Supabase configurations)
│   └── gateways/            # Repository implementers (LocalStorage Mock & Supabase SQL Mapper)
└── presentation/            # User Interface
    ├── components/          # Reusable UI widgets (Hero, Navbar, CertificateViewerModal...)
    ├── pages/               # Top-level route pages (Home, Admin, BlogDetail, Gallery...)
    ├── context/             # React State Providers (Theme, Languages...)
    └── styles/              # Global themes, scrollbars, and animations
```

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   npm or yarn package manager

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/addisuyirdaw/Addisu-s-Portfolio.git
    cd Addisu-s-Portfolio
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Copy the sample environment file and enter your configurations:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your Supabase credentials if using Supabase Mode:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Locally (Development Server):**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

5.  **Build for Production:**
    ```bash
    npm run build
    ```
    The compiled bundle will be output to the `dist/` directory.

---

## 🔒 Administration Access

*   **Route:** `/admin`
*   **Default Credentials (Mock Mode):**
    *   **Email:** `admin@addisu.com`
    *   **Password:** `admin123`
*   *Note: For production environments, utilize Supabase Auth with Row-Level Security (RLS) policies enabled.*
