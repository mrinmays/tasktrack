# TaskTrack

A task tracking application with Kanban boards, focus modes, and Jira integration.

## Features

- Kanban board for task management
- Inbox for task intake
- Focus mode with Pomodoro timer
- Search and settings

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- TanStack Router for routing
- Tailwind CSS for styling
- IndexedDB for local data storage

## Getting Started

Install dependencies with pnpm:

```
pnpm install
```

Start development server:

```
pnpm dev
```

Build for production:

```
pnpm build
```

## Project Structure

- `src/modules/`: Feature modules (kanban, inbox, focus, search, settings, tickets)
- `src/routes/`: Route definitions
- `src/contexts/`: React contexts
- `src/hooks/`: Custom hooks
- `src/services/`: API services
- `src/components/`: Shared components

## Development Notes

Run `pnpm check` after changes to verify linting and types.
