# StreakUp

StreakUp is a React + TypeScript web app for tracking daily consistency: permanent habits, custom tasks, DSA (data structures & algorithms) question practice, and productive activities — with streaks, progress statistics, monthly contribution calendars, and a browsable history view.

## Tech Stack

- React 18 + TypeScript
- Vite (dev server & build tool)
- Tailwind CSS
- Lucide React (icons)

All tracking data is stored locally in the browser (localStorage). No backend, database, or API keys are required — a fresh install starts from zero.

## Setup

Requirements: Node.js 18+ and npm.

```bash
npm install
```

## Running

```bash
npm run dev
```

Open the printed local URL (default http://localhost:5173) in your browser.

## Building for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Environment Variables

None required. `.env.example` is included for reference — the app works fully without any environment configuration.

## Project Structure

```
src/
  components/   # Reusable UI (cards, calendars, charts, navigation, etc.)
  pages/        # Dashboard, Progress, History, Settings views
  context/      # Data context (loads/saves app state)
  utils/        # Date helpers, streak calculations, storage layer
  types.ts      # Shared types, habit definitions
  index.css     # Tailwind entry + theme tokens
```

## Features

- Daily habit tracking with permanent and custom tasks
- DSA question logging with min/target goals and weekly charts
- Productive activity logging (learning, reading, events, etc.)
- Streaks: current/best streaks and overall productivity stats
- Monthly calendars: productivity calendar, DSA contribution calendar, and a color-coded history calendar (orange = productive day, green = DSA day, split = both)
- History browsing with read-only day details
- Settings: theme, timezone, weekly goal, DSA goals
- Optional sample data seeding for trying the app out

## Privacy

Your productivity history, DSA records, activities, and settings never leave your browser. Nothing is uploaded, and the source code contains no personal data.

## Resetting

Settings includes a reset action that clears all locally stored data and returns the app to a fresh state.
