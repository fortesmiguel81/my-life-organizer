# Life Organizer App

This is a Life Organizer app where users can track various aspects of their life such as finances, health, personal goals, and more. The app is built with modern web technologies to provide a seamless and interactive experience for managing day-to-day activities and long-term goals.

## Features

- Finance Management: Track income, expenses, and savings.
- Health Monitoring: Log health metrics and track progress over time.
- Goal Setting: Set personal and professional goals and monitor achievements.
- Responsive UI: Built with Shadcn UI for a clean and modern interface.
- User Authentication: Secure authentication and user management powered by Clerk.
- Backend API: Powered by Hono, a fast, small, and versatile web framework for building API endpoints.

## Tech Stack

- Frontend: Next.js - A React-based framework for building web applications.
- UI Components: Shadcn UI - A customizable UI component library.
- Authentication: Clerk - Authentication and user management solution.
- Database ORM: Drizzle - TypeScript-first ORM for database queries.
- Database: Neon - Fully managed Postgres database in the cloud.
- Backend API: Hono - Lightweight framework for the backend API.
- Local Development: Ngrok is used to expose the local server for webhook integrations between Clerk and the app.

## Project Structure

├── src
│ ├── api # Hono API routes and handlers
│ ├── components # Reusable UI components
│ ├── hooks # Custom React hooks
│ ├── pages # Next.js pages
│ ├── services # API integrations and database queries
│ ├── utils # Utility functions and constants
│ └── styles # Global styles
└── README.md

## Getting Started

### Prerequisites

- Node.js (v16+)
- Ngrok - To enable webhook integration for Clerk.
- Postgres Database - Neon cloud database connection details.

### Installation

1. Clone the repository:

        git clone https://github.com/yourusername/life-organizer-app.git

        cd life-organizer-app

2. Install dependencies:

        npm install

3. Set up environment variables: Create a .env.local file in the root directory and add the following:

        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
        CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PLUBLISHABLE_KEY>
        CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
        NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
        NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

        DATABASE_URL=<YOUR_DATABASE_URL>

4. Start Ngrok to expose the local server:

        http --domain=<YOUR_NGROK_DOMAIN> 3000

5. Run the development server:

        npm run dev

6. Open your browser and navigate to:

        http://localhost:3000

### Backend API (Hono)

The backend API is built using Hono, a lightweight and fast web framework. API routes can be found in the src/api directory. You can add, modify, or extend the API as needed.

### Database Migration

This app uses Drizzle ORM for database migrations. To run the migrations:

        npm run db:migrate

### Webhook Integration (Local Development)

To establish a webhook integration between Clerk and the local app, Ngrok is used to expose the local development server. Ensure that your Clerk webhook is pointed to your Ngrok URL.

Version1.0
