# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core Architecture

This is a **task management application** built around the **Eisenhower Matrix** (urgent/important quadrants) using Next.js 15 with TypeScript and Tailwind CSS.

### Key Concepts
- **Eisenhower Matrix**: Tasks are organized into 4 quadrants based on urgency and importance
  - `urgent_important`: Do First (Red) 
  - `urgent_not_important`: Delegate (Orange)
  - `not_urgent_important`: Schedule (Green)
  - `not_urgent_not_important`: Eliminate (Blue)
- **Drag & Drop**: Tasks can be moved between quadrants using `@hello-pangea/dnd`
- **Multi-project support**: Tasks belong to projects (Personal, BMN, CSuite)
- **CSV Import**: Designed to import task data from CSV files
- **Supabase Integration**: Backend database using `@supabase/supabase-js`

### Project Structure
- `src/types/task.ts`: Core data models and type definitions
- `src/components/EisenhowerMatrix.tsx`: Main drag-drop matrix interface
- `src/components/TaskCard.tsx`: Individual task display component
- `src/app/page.tsx`: Main application page with mock data
- `database-schema.md`: Complete database schema documentation

## Development Commands

```bash
# Development server (uses Turbopack)
npm run dev

# Production build (uses Turbopack)  
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

## Database Schema

The application expects these main entities:
- **Projects**: Multi-tenant organization (Personal, BMN, CSuite)
- **Tasks**: Core task entities with Eisenhower classification
- **Task Progress**: Daily tracking data (for CSV-like progress monitoring)
- **CSV Import Logs**: Track bulk imports

See `database-schema.md` for complete SQL schema and API endpoint specifications.

## Key Dependencies

- **UI Framework**: Next.js 15 with React 19, Tailwind CSS 4
- **Drag & Drop**: `@hello-pangea/dnd` for matrix interactions
- **Icons**: `@heroicons/react`, `lucide-react`
- **UI Components**: `@headlessui/react` for accessible components
- **Data**: `@supabase/supabase-js` for backend
- **CSV Processing**: `papaparse` for import functionality
- **Charts**: `recharts` for analytics/dashboard views
- **Date Handling**: `date-fns`

## Component Architecture

### Task Priority System
- Priority is derived from boolean flags (`is_urgent`, `is_important`) 
- Helper functions in `task.ts`: `getPriorityFromFlags()`, `getFlagsFromPriority()`
- CSV parsing helpers convert string priorities to enum values

### Drag & Drop Implementation
- Each matrix quadrant is a droppable zone
- Tasks are draggable items that update priority when moved
- Visual feedback during drag operations

### Status System
Five task statuses with icons and colors:
- `todo`, `doing`, `done`, `on_hold`, `help_me`
- Status configuration in `src/types/task.ts`

## Development Notes

- Uses **Turbopack** for faster builds and development
- **TypeScript strict mode** enabled
- **Path mapping**: `@/*` points to `src/*`
- **No test framework** currently configured
- **Mock data** in main page component for development
- API routes not yet implemented (see database schema for planned endpoints)

## Tailwind Configuration

Custom design system with:
- **Eisenhower Matrix colors**: Specific color scheme for each quadrant
- **Brand colors**: Professional task management palette
- **Glass morphism effects**: Premium UI styling
- **Custom animations**: Fade, slide, glow effects