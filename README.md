# Karta Connect

Karta Connect is a scholar and organization networking platform designed to connect scholars, organizations, and the Karta administration.

## Technology Stack

- Frontend: React, Vite, JavaScript
- Styling: CSS
- Routing: React Router
- Backend services: Supabase
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Icons: Lucide React

## Project Structure

```text
Karta_Connect/
├── backend/
│   ├── docs/
│   └── supabase/
│       ├── functions/
│       └── migrations/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── router/
│   │   ├── services/
│   │   └── styles/
│   ├── .env.example
│   └── package.json
├── docs/
├── CONTRIBUTING.md
└── README.md
```

## Getting Started

### Requirements

- Node.js and npm
- Git
- A configured Supabase project

### Installation

```bash
git clone <repository-url>
cd Karta_Connect
cd frontend
npm install
```

### Environment Configuration

Create `frontend/.env.local` using `frontend/.env.example`.

Configure:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env`, service-role keys, database passwords, or other secrets.

### Run Locally

```bash
cd frontend
npm run dev
```

### Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Application Areas

- Scholar portal
- Organization portal
- Admin portal
- Alumni portal
- Community feed
- Scholar profiles
- Organization profiles
- Job opportunities and applications
- Messaging interface
- Scholar invitations and account activation

Feature implementation status and known limitations are documented in [docs/FEATURES.md](docs/FEATURES.md).

## Architecture

The frontend communicates directly with Supabase through the Supabase JavaScript client and application service modules. There is no separate Express or FastAPI application server in the current project structure.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security

- Keep environment secrets out of source control.
- Enforce authorization through Supabase database policies, not only frontend route guards.
- Restrict access to scholar resumes and private profile information.
- Validate invitation and messaging permissions on the backend.
- Review Storage bucket access policies before deployment.

See the backend security documentation before changing database policies.

## Team Collaboration

Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing.

Use feature branches and pull requests. Avoid committing directly to `main`.

## Project Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for planned improvements.

## Important Note

This repository documents the current workspace. The actual hosted Supabase schema, deployed Edge Functions, Storage policies, and production configuration must be verified against the Supabase project before deployment or security sign-off.
