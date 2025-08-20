# IssueTracker - Customer Support Management System

## Overview

IssueTracker is a full-stack web application for managing customer support tickets and team collaboration. The system provides separate interfaces for customers to submit and track issues, and for support teams to manage and respond to those issues. Built with React on the frontend and Express.js on the backend, it offers real-time issue tracking, priority management, and internal/external communication features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with two main routes (customer and team views)
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form validation and user input handling
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Data Storage**: In-memory storage implementation with interface abstraction for future database integration
- **Validation**: Shared Zod schemas between frontend and backend for consistent data validation
- **API Design**: RESTful endpoints organized by resource (issues, comments, stats)
- **Development**: Hot reload and error handling with custom middleware for request logging

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with schema-first approach
- **Schema**: Three main entities - users, issues, and comments with proper relationships
- **Migration**: Drizzle Kit for database schema management and migrations
- **Connection**: Configured for Neon Database with connection pooling

### Key Features
- **Dual Interface**: Separate customer and team dashboards with role-appropriate functionality
- **Issue Management**: Complete CRUD operations for issues with status tracking (open, in-progress, resolved)
- **Priority System**: Four-level priority system (low, medium, high, urgent) for issue categorization
- **Comment System**: Internal and external comments with visibility controls for team collaboration
- **Real-time Updates**: Optimistic updates and cache invalidation for responsive user experience
- **Search and Filtering**: Advanced filtering by status, priority, and text search across multiple fields

### External Dependencies

- **Database**: Neon Database (PostgreSQL) for production data persistence
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Lucide React for consistent iconography
- **Development**: Replit-specific plugins for development environment integration
- **Validation**: Zod for runtime type checking and validation
- **Build**: ESBuild for production bundling and optimization