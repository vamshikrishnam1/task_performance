# Team Performance Dashboard

## Overview

This is a full-stack web application built for tracking team performance metrics with a focus on Task Completion Rate (TCR) and Task Precision Rate (TPR). The application allows users to create weekly reports for team members, track their performance metrics, and manage historical data.

## System Architecture

The application follows a simple and efficient architecture with minimal dependencies:

### Frontend Architecture
- **Framework**: React 18 (vanilla JS via CDN)
- **Styling**: Tailwind CSS via CDN
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Native fetch API
- **Build Tool**: None (static HTML file)

### Backend Architecture
- **Language**: Go (Golang)
- **Router**: Gorilla Mux for HTTP routing
- **Database**: PostgreSQL with native lib/pq driver
- **API Pattern**: RESTful API with JSON responses
- **Static Files**: Served directly by Go HTTP server
- **CORS**: Gorilla handlers for cross-origin requests

## Key Components

### Data Layer
- **Database Schema**: PostgreSQL tables with JSONB for flexible team data storage
- **Weekly Reports Table**: Stores team performance data with structured JSON fields
- **Direct SQL**: Native PostgreSQL queries with lib/pq driver
- **Schema Creation**: Automatic table creation on application startup

### API Layer
- **Routes**: HTTP handlers using Gorilla Mux router
- **Direct Database Access**: No ORM layer, direct SQL queries
- **Error Handling**: Standard HTTP error responses
- **CORS Support**: Cross-origin requests enabled via Gorilla handlers

### Frontend Components
- **Single Page App**: React components in one HTML file
- **Dashboard View**: Main interface for viewing and managing reports
- **Report Form**: Interactive form for creating new weekly reports
- **Report List**: List view of historical reports with actions
- **Report View**: Detailed view of individual reports

### Configuration
- **Team Members**: Hardcoded list of 8 team members
- **Week Owners**: Configurable week ownership assignments
- **Environment**: Simple environment variable configuration

## Data Flow

1. **Report Creation**: Users fill out the React form with team member metrics
2. **Data Submission**: Form data sent via fetch API to Go backend
3. **Storage**: Reports stored in PostgreSQL with JSONB fields for team data
4. **Retrieval**: Direct SQL queries fetch data from database
5. **Display**: Reports displayed in responsive React interface

## External Dependencies

### Runtime Dependencies
- **Go**: Backend runtime (1.21+)
- **PostgreSQL**: Database server for data persistence
- **Nginx**: Reverse proxy and static file serving

### Go Packages
- **gorilla/mux**: HTTP router for API endpoints
- **gorilla/handlers**: CORS and middleware support
- **lib/pq**: PostgreSQL driver for database connections

### Frontend Libraries (CDN)
- **React 18**: Frontend framework via unpkg CDN
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Babel Standalone**: JSX transformation in browser

## Deployment Strategy

### Build Process
- **Backend**: Single Go binary compilation with `go build`
- **Frontend**: Static HTML file with embedded React (no build step)
- **Database**: Automatic table creation on first run

### Environment Configuration
- **Production**: Single binary execution with systemd service
- **Database**: Local PostgreSQL with environment variable configuration
- **Static Files**: Served directly by Go HTTP server

### Hosting Considerations
- **Single Binary**: Easy deployment and distribution
- **Minimal Dependencies**: Only Go runtime and PostgreSQL required
- **Self-Contained**: All frontend assets embedded in static files

## Changelog

Changelog:
- July 07, 2025. Initial setup with Node.js/TypeScript stack
- July 07, 2025. Implemented PostgreSQL database with Drizzle ORM, migrated from in-memory storage to persistent database storage
- July 07, 2025. Enhanced dashboard layout with main reports view, added cancel button to form, improved visual hierarchy with performance indicators
- July 07, 2025. Added comprehensive README.md with complete self-hosting documentation
- July 07, 2025. Complete tech stack migration to Go backend, React frontend (CDN), PostgreSQL database, and Nginx reverse proxy for simplified deployment

## User Preferences

Preferred communication style: Simple, everyday language.