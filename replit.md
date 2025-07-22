# replit.md

## Overview

GitShip is a revolutionary, open-source deployment platform with flame-powered speed and intelligence, built as a comprehensive full-stack web application that redefines how developers ship code. The platform enables users to connect GitHub repositories through dual authentication (Replit Auth + GitHub OAuth) and automatically build and deploy static sites with real-time monitoring. The application uses a modern monorepo structure with separate client and server directories, implementing a git-driven workflow with atomic deployments and professional flame-themed UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark theme optimized)
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth using OpenID Connect with Passport.js
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time**: WebSocket support for live build logs

### Development Setup
- **Monorepo Structure**: Client and server code in separate directories with shared schema
- **Build System**: Vite for frontend bundling, esbuild for server bundling
- **Development**: Hot reload via Vite dev server with Express middleware
- **Type Safety**: Shared TypeScript interfaces between client and server

## Key Components

### Database Schema
Located in `shared/schema.ts`, defines:
- **Users table**: Stores user authentication data from Replit Auth
- **Projects table**: Repository information, build configuration, and deployment settings
- **Deployments table**: Build status, logs, and deployment metadata
- **Functions table**: Serverless function configurations
- **Analytics table**: Site performance and usage metrics
- **Sessions table**: Required for Replit Auth session management

### Authentication System
- Replit Auth integration with OpenID Connect
- JWT token handling and session management
- Automatic user creation and profile synchronization
- Protected routes with authentication middleware

### Project Management
- GitHub repository integration
- Build configuration (commands, output directories, frameworks)
- Environment variable management
- Custom domain support
- Branch-based deployments

### Deployment Pipeline
- Webhook-triggered builds from Git pushes
- Real-time build log streaming via WebSockets
- Atomic deployment strategy with rollback capability
- Static asset hosting and CDN integration
- Build status tracking and notifications

### Real-time Features
- Live build logs during deployment
- WebSocket connection management
- Real-time deployment status updates

## Recent Major Updates (January 22, 2025)

### Professional Documentation & Project Structure Enhancement
- **Comprehensive README**: Created professional documentation combining technical implementation with clear setup instructions
- **Contributing Guidelines**: Established complete contribution framework with coding standards, testing guidelines, and security practices
- **Project Positioning**: Enhanced GitShip branding as the next-generation deployment platform with flame-powered speed and developer-first innovation
- **Development Roadmap**: Defined clear production phases from core infrastructure to enterprise features

### GitHub OAuth Integration Implementation
- **Dual Authentication Architecture**: Implemented separate GitHub OAuth for repository access while maintaining Replit Auth for user authentication
- **GitHub API Integration**: Complete @octokit/rest integration with repository browsing, branch selection, and webhook management
- **Repository Management**: Interactive repository selector with search, metadata display, and automatic framework detection
- **Database Schema Updates**: Enhanced user and project tables to support GitHub tokens, repository metadata, and webhook configurations
- **Enhanced Project Creation**: GitHub repository validation, automatic framework detection, and webhook setup for continuous deployment

### Technical Infrastructure Improvements
- **GitHub Service Layer**: Comprehensive GitHubService class with repository operations, webhook management, and framework detection
- **Type-safe API Routes**: Enhanced backend routes with GitHub integration, error handling, and user validation
- **Frontend Components**: New GitHubConnectButton and RepositorySelector components with real-time repository browsing
- **Authentication Flow**: Complete OAuth callback handling with token storage and user GitHub profile synchronization

### Previous Updates (January 21, 2025)

### Breakthrough Features Beyond Netlify
- **AI Copilot**: Intelligent development assistant with real-time code analysis, automated debugging, and performance optimization suggestions
- **Performance Insights**: Advanced performance monitoring with automated optimization opportunities and real-time metrics
- **Developer-First Design**: Focus on improving developer experience with intelligent tooling and actionable insights
- **Complete Documentation Platform**: Comprehensive docs, guides, and templates sections with advanced search and categorization

### Differentiating Advantages Over Netlify
1. **AI-Powered Development**: Built-in AI assistant for debugging, optimization, and best practices
2. **Real-time Performance Intelligence**: Automated performance monitoring with actionable optimization suggestions
3. **Open Source Integration**: Native support for open source tools and community-driven development
4. **Advanced Collaboration**: Enhanced team features with intelligent project insights and recommendations

### Previous Updates (January 19, 2025)

### Advanced Feature Implementation
- **Real-time Build Logs**: WebSocket integration for live build streaming with auto-scroll and download capabilities
- **Team Collaboration**: Complete team management with role-based permissions (Owner, Admin, Developer, Viewer)
- **Domain Management**: Custom domain configuration with DNS setup guidance and SSL status tracking
- **Enhanced Project Detail**: Comprehensive tabbed interface with overview, builds, analytics, domains, team, and settings
- **Professional UI Components**: Advanced sidebar navigation, build log streaming, and team invitation system

### Technical Infrastructure
- **WebSocket Server**: Real-time communication for build logs with subscription management
- **Team API Routes**: Full CRUD operations for team member management and invitations
- **Domain API Routes**: Custom domain management with verification and SSL tracking
- **Enhanced Database Schema**: Added team collaboration and domain management data structures
- **Component Architecture**: Modular components for build logs, team management, and domain configuration

### User Experience Improvements
- **Tabbed Project Interface**: Organized project management with dedicated sections for different functionalities
- **Real-time Updates**: Live build progress with WebSocket streaming and status indicators
- **Professional Design**: Dark mode with neon accents, consistent with GitShip branding
- **Comprehensive Statistics**: Detailed project metrics including success rates, build times, and deployment history

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, creating/updating user records
2. **Project Creation**: Users connect GitHub repositories, storing configuration in projects table
3. **Team Collaboration**: Project owners invite team members with role-based access control
4. **Build Trigger**: Manual or webhook-triggered builds with real-time WebSocket log streaming
5. **Domain Configuration**: Custom domain setup with DNS verification and SSL certificate management
6. **Analytics Tracking**: Comprehensive metrics collection for performance monitoring

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database client
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **passport**: Authentication middleware
- **express-session**: Session management

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS processing
- **esbuild**: Fast JavaScript/TypeScript bundler for server

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling integration

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with automatic restart on changes
- Shared TypeScript configuration for type safety
- Real-time error reporting and debugging tools

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Database: Drizzle migrations for schema updates
- Environment: PostgreSQL database provisioning required

### Infrastructure Requirements
- PostgreSQL database (configured via DATABASE_URL)
- Node.js runtime environment
- Static file serving capability
- WebSocket support for real-time features
- Session secret for authentication (SESSION_SECRET)

The application follows a clean separation of concerns with shared TypeScript types, making it easy to maintain type safety across the full stack while providing a modern development experience optimized for the Replit platform.