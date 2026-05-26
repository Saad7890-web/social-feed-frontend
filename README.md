# Social Feed Frontend

A production-ready social feed frontend built with **React 19**, **TypeScript**, and **Vite**. The app provides authentication, a protected feed, post creation and editing, likes, threaded comments, replies, and image uploads through a signed upload flow.

## Tech Stack

- **React 19** for the UI layer
- **TypeScript** for strict, typed development
- **Vite** for fast local development and production builds
- **React Router DOM** for client-side routing and route protection
- **Axios** for the HTTP layer
- **React Hook Form** for form handling
- **Zod** for schema-based validation

## What the app does

- User registration, login, logout, and session bootstrap
- Protected feed route with guest-only login/register routes
- Post creation, editing, deletion, likes, and visibility control
- Threaded comments and replies with pagination
- Signed image upload flow with backend verification
- CSRF token bootstrap and automatic retry for unsafe requests
- Cursor-based feed loading for better scaling

## Design Principles

### 1. Separation of concerns

UI components, API calls, auth/session handling, validation, and utility functions are split into dedicated folders. This keeps the codebase easier to reason about and safer to change.

### 2. Typed boundaries

The app uses shared TypeScript interfaces for posts, comments, users, and API payloads. This reduces runtime surprises and makes API changes easier to track.

### 3. Reusable feature components

Feed, composer, comment, and route-guard logic are isolated into reusable building blocks instead of being mixed into pages.

### 4. Resilient network layer

Requests go through a centralized Axios client with:

- a configurable base URL
- credentials enabled
- CSRF token bootstrap
- retry logic for CSRF failures
- response normalization for inconsistent backend shapes

### 5. Scalable data fetching

The feed and comment trees use cursor-based pagination, which is a better fit for growing datasets than offset-based pagination.

## Scalability Notes

- **Cursor pagination** keeps infinite scroll and large feeds responsive.
- **Request de-duplication** avoids duplicate in-flight calls for the same feed/comment/reply page.
- **Signed image uploads** offload heavy file transfer work to Cloudinary instead of routing files through the app server.
- **Stateless frontend deployment** makes it easy to scale the UI horizontally behind any static host or CDN.
- **Modular API wrappers** make it easier to swap backend endpoints or add caching later.
- **Route guards** keep authentication logic out of individual pages and reduce duplicated checks.

## Project Structure

- `src/pages` — route-level screens
- `src/components` — reusable UI and route guards
- `src/components/feed` — feed-specific UI and interaction logic
- `src/context/AuthContext.tsx` — session state and auth actions
- `src/lib` — API client, auth helpers, upload flow, validation, and utilities
- `src/types` — shared domain models for API responses and forms
- `public/assets` — static assets used by the app

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Available variable:

- `VITE_API_BASE_URL` — backend API base URL, for example `http://localhost:5000/api`

Important: this value is embedded at build time by Vite, so production builds must be created with the correct API URL.

## Local Development

### Prerequisites

- Node.js 22+ recommended
- npm 10+ recommended

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app runs on the Vite development server, usually at `http://localhost:3000`.

### Lint the project

```bash
npm run lint
```

### Build for production

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

## Docker

### Build the image

```bash
docker build   --build-arg VITE_API_BASE_URL=http://localhost:5000/api   -t social-feed-frontend .
```

### Run the container

```bash
docker run --rm -p 8080:8080 social-feed-frontend
```

Open the app at `http://localhost:8080`.

## Backend Expectations

This frontend expects a backend that provides:

- session-based auth endpoints
- CSRF token endpoint
- feed/post/comment APIs
- signed upload endpoints
- Cloudinary verification support

If the backend base URL changes, rebuild the frontend image or re-run the Vite build with the new `VITE_API_BASE_URL`.

## Key Implementation Details

- `AuthContext` boots the session once and shares the user state across the app.
- `ProtectedRoute` and `GuestRoute` keep navigation rules centralized.
- `FeedPage` orchestrates feed loading, post actions, comments, and replies.
- `lib/api.ts` is the single request entry point for all API calls.
- `lib/uploads.ts` uses a sign → upload → verify flow for images.

## Recommended Production Deployment Flow

1. Set the correct API base URL.
2. Build the static bundle.
3. Serve the `dist` output from Nginx or any static hosting platform.
4. Keep the backend and frontend as separate deployable services.
