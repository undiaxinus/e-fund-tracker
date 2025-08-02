# E-Fund Tracker - File Structure

## Project Overview
A comprehensive disbursement tracking system for government financial management with role-based access control.

## Directory Structure

```
e-fund-tracker/
├── .angular/                     # Angular cache and build artifacts
├── .editorconfig                 # Editor configuration
├── .gitignore                    # Git ignore rules
├── .postcssrc.json              # PostCSS configuration
├── .trae/                        # Trae AI configuration
│   └── rules/
│       └── project_rules.md
├── .vscode/                      # VS Code settings
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── CONNECTION_TEST.md            # Database connection testing guide
├── FILE_STRUCTURE.md             # This file - project structure documentation
├── README.md                     # Project overview and setup
├── SUPABASE_SETUP.md            # Supabase configuration guide
├── angular.json                  # Angular CLI configuration
├── package.json                  # Node.js dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── prisma/                       # Database schema and migrations
│   └── schema.prisma            # Prisma database schema
├── public/                       # Static assets served by Angular
│   ├── favicon.ico
│   └── assets/
│       └── images/
│           ├── finance-logo.svg
│           ├── pnp-logo.png
│           └── pnp-logo.svg
├── scripts/                      # Utility scripts
│   ├── test-connection.ps1      # PowerShell connection test
│   └── test-supabase.js         # Node.js Supabase test
├── sql/                          # Database SQL files
│   ├── create_admin_account.sql # Admin account creation
│   ├── database_schema.sql      # Complete database schema
│   └── fix_rls_auth.sql         # RLS authentication fixes
├── src/                          # Angular application source
│   ├── app/
│   │   ├── app.config.server.ts # Server-side rendering config
│   │   ├── app.config.ts        # Application configuration
│   │   ├── app.css              # Global app styles
│   │   ├── app.html             # Root app template
│   │   ├── app.routes.server.ts # Server-side routes
│   │   ├── app.routes.ts        # Client-side routes
│   │   ├── app.spec.ts          # App component tests
│   │   ├── app.ts               # Root app component
│   │   ├── core/                # Core services and guards
│   │   │   ├── core.module.ts   # Core module definition
│   │   │   ├── guards/          # Route guards
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/    # HTTP interceptors (empty)
│   │   │   └── services/        # Core services
│   │   │       ├── auth.service.ts
│   │   │       └── supabase.service.ts
│   │   ├── features/            # Feature modules (standalone components)
│   │   │   ├── admin/           # Admin role features
│   │   │   │   ├── admin.routes.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.component.css
│   │   │   │   │   ├── dashboard.component.html
│   │   │   │   │   └── dashboard.component.ts
│   │   │   │   ├── manage-classifications/
│   │   │   │   │   ├── manage-classifications.component.ts
│   │   │   │   │   └── manage-classifications.routes.ts
│   │   │   │   ├── manage-roles/
│   │   │   │   │   ├── manage-roles.component.ts
│   │   │   │   │   └── manage-roles.routes.ts
│   │   │   │   ├── manage-users/
│   │   │   │   │   ├── manage-users.component.ts
│   │   │   │   │   ├── manage-users.routes.ts
│   │   │   │   │   └── user-form/
│   │   │   │   └── services/    # Admin-specific services
│   │   │   ├── auth/            # Authentication features
│   │   │   │   └── login/
│   │   │   │       ├── login.component.css
│   │   │   │       ├── login.component.html
│   │   │   │       └── login.component.ts
│   │   │   ├── dashboard/       # General dashboard (legacy)
│   │   │   │   ├── dashboard.component.css
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── encoder/         # Encoder role features
│   │   │   │   ├── encoder.routes.ts
│   │   │   │   ├── entries/     # Disbursement entry management
│   │   │   │   │   ├── disbursement-form/
│   │   │   │   │   │   ├── disbursement-form.component.css
│   │   │   │   │   │   ├── disbursement-form.component.html
│   │   │   │   │   │   └── disbursement-form.component.ts
│   │   │   │   │   ├── disbursement-list/
│   │   │   │   │   │   ├── disbursement-list.component.css
│   │   │   │   │   │   ├── disbursement-list.component.html
│   │   │   │   │   │   └── disbursement-list.component.ts
│   │   │   │   │   └── entries.routes.ts
│   │   │   │   ├── my-reports/  # Encoder's personal reports
│   │   │   │   │   ├── my-reports.component.ts
│   │   │   │   │   └── my-reports.routes.ts
│   │   │   │   └── services/    # Encoder-specific services
│   │   │   ├── landing/         # Landing page
│   │   │   │   ├── landing.component.css
│   │   │   │   ├── landing.component.html
│   │   │   │   └── landing.component.ts
│   │   │   └── viewer/          # Viewer role features
│   │   │       ├── dashboard/   # Viewer dashboard
│   │   │       │   ├── dashboard.routes.ts
│   │   │       │   └── viewer-dashboard.component.ts
│   │   │       ├── reports/     # Report viewing and export
│   │   │       │   ├── export-reports/
│   │   │       │   │   └── export-reports.component.ts
│   │   │       │   ├── reports.component.ts
│   │   │       │   └── reports.routes.ts
│   │   │       ├── services/    # Viewer-specific services
│   │   │       └── viewer.routes.ts
│   │   ├── layout/              # Layout components
│   │   │   └── main-layout/
│   │   │       ├── main-layout.component.css
│   │   │       ├── main-layout.component.html
│   │   │       └── main-layout.component.ts
│   │   ├── shared/              # Shared components and utilities
│   │   │   ├── components/
│   │   │   │   ├── connection-test/
│   │   │   │   │   └── connection-test.component.ts
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.component.css
│   │   │   │   │   ├── header.component.html
│   │   │   │   │   └── header.component.ts
│   │   │   │   └── sidebar/
│   │   │   │       ├── sidebar.component.css
│   │   │   │       ├── sidebar.component.html
│   │   │   │       └── sidebar.component.ts
│   │   │   ├── directives/      # Custom directives (empty)
│   │   │   ├── pipes/           # Custom pipes (empty)
│   │   │   ├── services/        # Shared services
│   │   │   │   ├── layout.service.ts
│   │   │   │   └── sidebar.service.ts
│   │   │   └── shared.module.ts # Shared module definition
│   │   └── types/               # TypeScript type definitions
│   │       ├── disbursement.model.ts
│   │       ├── enums.ts
│   │       ├── index.ts
│   │       └── user.model.ts
│   ├── assets/                  # Application assets
│   │   └── images/
│   │       ├── finance-logo.png
│   │       ├── finance-logo.svg
│   │       └── pnp-logo.png
│   ├── environments/            # Environment configurations
│   │   ├── environment.prod.ts
│   │   └── environment.ts
│   ├── index.html               # Main HTML file
│   ├── main.server.ts           # Server-side entry point
│   ├── main.ts                  # Client-side entry point
│   ├── server.ts                # Express server configuration
│   └── styles.css               # Global styles
├── tsconfig.app.json            # TypeScript config for app
├── tsconfig.json                # Main TypeScript configuration
└── tsconfig.spec.json           # TypeScript config for tests
```

## Key Features by Directory

### Core Features
- **Authentication & Authorization**: Role-based access (Admin, Encoder, Viewer)
- **Disbursement Management**: CRUD operations with classification (PS, MOOE, CO, TR)
- **Reporting System**: PDF/Excel export capabilities
- **User Management**: Admin panel for user control
- **Audit Trail**: System logs and activity tracking

### Module Breakdown

#### 1. Core Module
- **Guards**: Authentication and role-based route protection
- **Services**: Core business logic (Auth, Supabase integration)
- **Interceptors**: HTTP request/response handling (planned)

#### 2. Features Module (Standalone Components)
- **Admin Features**:
  - Dashboard with system overview
  - User management (CRUD operations)
  - Role and classification management
  - System administration tools
- **Encoder Features**:
  - Disbursement entry forms with validation
  - Disbursement list with filtering/sorting
  - Personal reports and analytics
- **Viewer Features**:
  - Read-only dashboard
  - Report viewing and export functionality
  - Data analysis tools
- **Auth Features**:
  - Login/logout functionality
  - Session management
- **Landing Page**: Public-facing entry point

#### 3. Layout Module
- **Main Layout**: Primary application shell with header/sidebar
- Responsive design for different screen sizes
- Navigation and user interface structure

#### 4. Shared Module
- **Components**: Reusable UI components (Header, Sidebar, Connection Test)
- **Services**: Shared business logic (Layout, Sidebar management)
- **Types**: TypeScript interfaces and models
- **Directives & Pipes**: Custom Angular utilities (planned)

## Technology Stack
- **Frontend**: Angular 20+ with TypeScript
- **Architecture**: Standalone Components (modern Angular approach)
- **Database**: PostgreSQL with Supabase
- **ORM**: Prisma for database schema management
- **Styling**: CSS3 with PostCSS processing
- **State Management**: Angular Signals and Services
- **HTTP Client**: Angular HttpClient with Supabase SDK
- **Forms**: Reactive Forms with validation
- **Routing**: Angular Router with Guards
- **Build Tool**: Angular CLI with Vite
- **Server**: Express.js for SSR support
- **Package Manager**: npm

## Database Integration
- **Supabase**: Backend-as-a-Service for authentication and database
- **Prisma**: Type-safe database client and schema management
- **PostgreSQL**: Primary database with Row Level Security (RLS)
- **Real-time**: Supabase real-time subscriptions for live updates

## Security Features
- JWT token authentication
- Role-based access control (Admin, Encoder, Viewer)
- Input validation and sanitization
- Row Level Security (RLS) in database
- Secure API endpoints with Supabase
- Environment-based configuration

## Current Implementation Status

### ✅ Completed Features
- **Project Structure**: Modern Angular 20+ standalone components architecture
- **Authentication System**: Login component with role-based routing
- **Database Schema**: Complete Prisma schema with all required tables
- **Core Services**: Auth and Supabase integration services
- **Layout Components**: Main layout with header and sidebar
- **Admin Features**: Dashboard and user management components
- **Encoder Features**: Disbursement entry and listing components
- **Viewer Features**: Dashboard and reporting components
- **Landing Page**: Public entry point with PNP branding
- **Routing**: Role-based route guards and lazy loading

### 🚧 In Progress
- **Form Validation**: Enhanced validation for disbursement forms
- **Report Generation**: PDF/Excel export functionality
- **Real-time Updates**: Supabase real-time subscriptions
- **Error Handling**: Global error interceptors
- **Testing**: Unit and integration tests

### 📋 Planned Features
- **Audit Trail**: Complete activity logging system
- **Advanced Filtering**: Enhanced search and filter capabilities
- **Data Visualization**: Charts and analytics dashboards
- **Bulk Operations**: Mass data import/export
- **Notifications**: Real-time user notifications
- **Mobile Responsiveness**: Enhanced mobile UI/UX

## Development Notes

### Architecture Decisions
- **Standalone Components**: Using Angular 20+ standalone components for better tree-shaking and modularity
- **Signals**: Leveraging Angular Signals for reactive state management
- **Supabase**: Chosen for rapid development with built-in auth, real-time, and database
- **Prisma**: Type-safe database operations with excellent TypeScript integration
- **Role-based Structure**: Features organized by user roles for clear separation of concerns

### File Naming Conventions
- **Components**: `kebab-case.component.ts/html/css`
- **Services**: `kebab-case.service.ts`
- **Guards**: `kebab-case.guard.ts`
- **Routes**: `feature.routes.ts`
- **Models**: `kebab-case.model.ts`
- **Enums**: `enums.ts`

### Code Organization
- **Feature-based**: Each role has its own feature directory
- **Shared Resources**: Common components and services in shared module
- **Type Safety**: Strong TypeScript typing throughout the application
- **Lazy Loading**: Route-based code splitting for optimal performance

## Getting Started

1. **Prerequisites**: Node.js 18+, Angular CLI 20+
2. **Installation**: `npm install`
3. **Database Setup**: Follow `SUPABASE_SETUP.md`
4. **Environment**: Configure `src/environments/environment.ts`
5. **Development**: `ng serve --port 4201`
6. **Testing**: `npm test`

## Related Documentation
- `README.md` - Project overview and setup instructions
 - `SUPABASE_SETUP.md` - Database configuration guide
 - `CONNECTION_TEST.md` - Database connection testing
 - `prisma/schema.prisma` - Complete database schema
 - `sql/` - Database setup and migration scripts

## Deployment Structure
- Cloud-hosted application
- Automated backup systems
- Environment-specific configurations
- CI/CD pipeline ready

This structure supports all user stories and requirements while maintaining scalability and security standards.