# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + TypeScript + Vite single-page application that calculates ToMo Index scores based on 6 questions about work motivation. The application evaluates motivation factors on a scale from -100 to +100, showing positive/negative factors and individual question contributions.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (includes TypeScript compilation)
- **Preview production build**: `npm run preview`
- **Run tests**: `npm test` (Vitest with jsdom environment)
- **Install dependencies**: `npm i`

## Architecture

### Application Structure
- **Single Page Application** with React Router for client-side routing
- **State Management**: React Context (DiagnosticContext) with useReducer for answers and results
- **Lazy Loading**: All pages are lazy-loaded for performance
- **Error Boundaries**: Global error handling with custom ErrorBoundary component

### Key Directories
- `src/pages/`: Main application screens (Landing, Diagnostic, Results)
- `src/components/`: Reusable UI components organized by type (ui/, forms/, charts/)
- `src/state/`: Context providers and state management
- `src/utils/`: Core business logic (scoring calculations, sharing functionality)
- `src/constants/`: Question definitions and configuration
- `src/types/`: TypeScript type definitions

### Core Modules
- **Scoring Engine** (`src/utils/scoring.ts`): Calculates ToMo Index with weighted question values
- **Question Configuration** (`src/constants/questions.ts`): 6 questions with weights and positive/negative types
- **Share System** (`src/utils/share.ts`): Client-side HMAC for sharing URLs (note: not tamper-proof)

### Styling
- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Accessibility features**: ARIA labels, keyboard navigation (1-7 keys), fieldset/legend grouping

### Testing Setup
- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- Test files: `**/*.test.{ts,tsx}` and `**/__tests__/**/*.{ts,tsx}`
- Setup file: `src/setupTests.ts`

## Environment Variables

- `VITE_SHARE_SECRET`: Secret key for shared URL signing (set in `.env` file)

## Deployment

Static hosting compatible (Vercel/Netlify). Routing configuration included:
- `vercel.json`: Vercel SPA fallback configuration
- `netlify.toml`: Netlify SPA redirect rules

## Important Notes

- All shared URLs use client-side HMAC signing - not suitable for strict tamper prevention
- Score calculation uses specific weights: positive factors (10, 5, 1.66) and negative factors (-1.66, -5, -10)
- Questions use 1-7 scale responses that get weighted according to motivation theory
- Application is fully Japanese language with work motivation assessment focus