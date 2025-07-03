# Team Performance Dashboard

## Overview

This is a full-stack web application built for tracking team performance metrics with a focus on Task Completion Rate (TCR) and Task Precision Rate (TPR). The application allows users to create weekly reports for team members, track their performance metrics, and manage historical data.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Session Management**: Built-in Express session handling
- **Storage**: Database-backed persistent storage for weekly reports

## Key Components

### Data Layer
- **Database Schema**: Defined in `shared/schema.ts` using Drizzle ORM
- **Weekly Reports Table**: Stores team performance data with JSON fields for flexible team member data
- **Validation**: Zod schemas for runtime type checking and validation
- **Migrations**: Managed through Drizzle Kit

### API Layer
- **Routes**: Centralized in `server/routes.ts`
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request/response logging for API endpoints

### Frontend Components
- **Dashboard**: Main interface for viewing and managing reports
- **Report Form**: Interactive form for creating new weekly reports
- **Recent Reports**: List view of historical reports with actions
- **UI Components**: Comprehensive set of reusable UI components

### Shared Types
- **Schema Definitions**: Type-safe data models shared between frontend and backend
- **Team Configuration**: Predefined team members and week owners
- **Validation Schemas**: Shared validation logic using Zod

## Data Flow

1. **Report Creation**: Users fill out the report form with team member metrics
2. **Validation**: Data is validated on both client and server using shared Zod schemas
3. **Storage**: Reports are stored in PostgreSQL with JSON fields for team data
4. **Retrieval**: TanStack Query manages data fetching and caching
5. **Display**: Reports are displayed in a responsive dashboard interface

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Connection**: Uses `@neondatabase/serverless` driver
- **Configuration**: Managed through `DATABASE_URL` environment variable

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: For component variant management

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast bundling for production
- **Vite**: Development server and build tool
- **Drizzle Kit**: Database migration tool

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations are applied via `db:push` command

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution
- **Production**: Runs compiled JavaScript with Node.js
- **Database**: Requires `DATABASE_URL` environment variable

### Hosting Considerations
- **Static Assets**: Frontend built for CDN deployment
- **API Server**: Express server ready for containerization
- **Database**: Compatible with any PostgreSQL-compatible service

## Changelog

Changelog:
- July 03, 2025. Initial setup
- July 03, 2025. Implemented PostgreSQL database with Drizzle ORM, migrated from in-memory storage to persistent database storage
- July 03, 2025. Enhanced dashboard layout with main reports view, added cancel button to form, improved visual hierarchy with performance indicators
- July 03, 2025. Added comprehensive README.md with complete self-hosting documentation

## User Preferences

Preferred communication style: Simple, everyday language.