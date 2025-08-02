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
│   │   ├── core/                 # Core services and guards
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── disbursement.service.ts
│   │   │   │   ├── report.service.ts
│   │   │   │   └── audit.service.ts
│   │   │   └── interceptors/
│   │   │       ├── auth.interceptor.ts
│   │   │       └── error.interceptor.ts
│   │   ├── shared/               # Shared components and utilities
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── loading/
│   │   │   │   ├── confirmation-dialog/
│   │   │   │   └── data-table/
│   │   │   ├── pipes/
│   │   │   │   ├── currency.pipe.ts
│   │   │   │   └── date-format.pipe.ts
│   │   │   ├── validators/
│   │   │   │   └── custom-validators.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── disbursement.model.ts
│   │   │       ├── classification.model.ts
│   │   │       └── report.model.ts
│   │   ├── features/              # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.css
│   │   │   │   └── auth.module.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   ├── dashboard.component.css
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── summary-card/
│   │   │   │   │   ├── chart-widget/
│   │   │   │   │   └── recent-transactions/
│   │   │   │   └── dashboard.module.ts
│   │   │   ├── disbursements/
│   │   │   │   ├── disbursement-list/
│   │   │   │   │   ├── disbursement-list.component.ts
│   │   │   │   │   ├── disbursement-list.component.html
│   │   │   │   │   └── disbursement-list.component.css
│   │   │   │   ├── disbursement-form/
│   │   │   │   │   ├── disbursement-form.component.ts
│   │   │   │   │   ├── disbursement-form.component.html
│   │   │   │   │   └── disbursement-form.component.css
│   │   │   │   ├── disbursement-detail/
│   │   │   │   └── disbursements.module.ts
│   │   │   ├── reports/
│   │   │   │   ├── report-generator/
│   │   │   │   │   ├── report-generator.component.ts
│   │   │   │   │   ├── report-generator.component.html
│   │   │   │   │   └── report-generator.component.css
│   │   │   │   ├── report-viewer/
│   │   │   │   ├── export-options/
│   │   │   │   └── reports.module.ts
│   │   │   ├── admin/
│   │   │   │   ├── user-management/
│   │   │   │   │   ├── user-list/
│   │   │   │   │   ├── user-form/
│   │   │   │   │   └── user-detail/
│   │   │   │   ├── classification-management/
│   │   │   │   ├── system-logs/
│   │   │   │   ├── settings/
│   │   │   │   └── admin.module.ts
│   │   │   └── archive/
│   │   │       ├── archive-list/
│   │   │       ├── archive-search/
│   │   │       └── archive.module.ts
│   │   ├── layout/               # Layout components
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts
│   │   │   │   ├── main-layout.component.html
│   │   │   │   └── main-layout.component.css
│   │   │   └── auth-layout/
│   │   │       ├── auth-layout.component.ts
│   │   │       ├── auth-layout.component.html
│   │   │       └── auth-layout.component.css
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.component.css
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   ├── styles.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── index.html
│   └── main.ts
├── backend/                      # Backend API (if needed)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── docs/                         # Documentation
│   ├── API.md
│   ├── USER_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
├── scripts/                      # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── backup.sh
├── tests/                        # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── userinput.py                  # Interactive task loop GUI
├── package.json
├── angular.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Key Features by Directory

### Core Features
- **Authentication & Authorization**: Role-based access (Admin, Encoder, Viewer)
- **Disbursement Management**: CRUD operations with classification (PS, MOOE, CO, TR)
- **Reporting System**: PDF/Excel export capabilities
- **User Management**: Admin panel for user control
- **Audit Trail**: System logs and activity tracking

### Architectural Changes

#### Unified User Module Approach
The application has been restructured to use a **unified user module** instead of separate encoder and viewer modules:

- **Before**: Separate `/encoder` and `/viewer` feature modules
- **After**: Single `/user` module with role-based permissions

#### Benefits of Unified Architecture
1. **Code Reusability**: Shared components between ENCODER and VIEWER roles
2. **Simplified Maintenance**: Single codebase for user-facing features
3. **Consistent UI/UX**: Uniform experience across different user roles
4. **Role-based Access**: Dynamic content based on user permissions within the same components
5. **Scalability**: Easier to add new roles or modify permissions

#### Role-based Access Implementation
- **ENCODER Role**: Full access to entries (create, edit, delete) + reports
- **VIEWER Role**: Read-only access to dashboard and reports
- **Dynamic UI**: Components show/hide features based on user permissions
- **Route Guards**: Protect sensitive operations at the route level

### Module Breakdown

#### 1. Auth Module
- Login/logout functionality
- Role-based route protection
- Session management

#### 2. Dashboard Module
- Financial summaries
- Quick stats widgets
- Recent transaction overview

#### 3. Disbursements Module
- Data entry forms with validation
- Classification tagging
- Edit/update capabilities
- Filtering and sorting

#### 4. Reports Module
- Report generation interface
- Export options (PDF, Excel)
- Custom date ranges
- Department/category filtering

#### 5. Admin Module (Admin only)
- User account management
- Classification configuration
- System monitoring
- Settings management

#### 6. Archive Module
- Historical transaction search
- Data archival management
- Audit trail viewing

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