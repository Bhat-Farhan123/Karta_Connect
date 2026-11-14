# Contributing to Karta Connect

Thank you for contributing to Karta Connect.

## 1. Before Starting

- Read the root README.
- Understand the existing feature structure.
- Confirm the task with the project coordinator.
- Pull the latest changes from `main`.

## 2. Local Setup

```bash
git clone <repository-url>
cd Karta_Connect/frontend
npm install
```

Create `frontend/.env.local` using `frontend/.env.example` and configure the required Supabase values.

Start the development server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

## 3. Branching

Do not work directly on `main`.

Create a branch for each task:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

Suggested branch naming:

- `feature/scholar-profile`
- `feature/organization-portal`
- `feature/community-feed`
- `feature/messaging`
- `feature/admin-tools`
- `fix/issue-description`
- `docs/documentation-update`

## 4. Development Guidelines

- Follow the existing React component and service structure.
- Reuse existing components and services where appropriate.
- Avoid unrelated changes.
- Do not commit `.env` files, credentials, `node_modules`, or build output.
- Never put Supabase service-role keys in frontend code.
- Do not weaken database policies to make a feature work.
- Coordinate before modifying shared files such as `App.jsx`, `AppRouter.jsx`, `AuthContext.jsx`, or shared styles.

## 5. Before Opening a Pull Request

Run:

```bash
npm run build
```

Then inspect your changes:

```bash
git status
git diff
```

Check that no credentials or personal test data are included.

## 6. Push Your Branch

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-feature-name
```

Open a pull request against `main`.

## 7. Pull Request Checklist

- [ ] The change addresses the assigned task.
- [ ] Existing functionality has not been unnecessarily modified.
- [ ] Production build succeeds.
- [ ] No secrets or personal data are included.
- [ ] Database changes and required policies are documented.
- [ ] Screenshots are included for significant UI changes.
- [ ] The pull request explains what changed and how it was tested.

## 8. Collaboration Rules

- One person should own a feature or clearly defined task.
- Communicate before editing shared files.
- Do not merge another person's work without reviewing it.
- Keep pull requests focused and reasonably small.
- Resolve conflicts with the relevant contributor before merging.
