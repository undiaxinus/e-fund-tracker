# E-Fund Tracker - File Structure

## Project Overview
A comprehensive disbursement tracking system for government financial management with role-based access control.

## Directory Structure

```
e-fund-tracker/
├── .angular/                     # Angular cache
├── .trae/                        # Trae AI configuration
├── .vscode/                      # VS Code settings
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── images/
│   │   ├── logo.png
│   │   └── icons/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── core/                 # Core services and guards
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── supabase.service.ts
│   │   │   │   └── disbursement.service.ts
│   │   │   └── interceptors/
│   │   │       ├── auth.interceptor.ts
│   │   │       └── error.interceptor.ts
│   │   ├── shared/               # Shared components and utilities
│   │   │   ├── components/
│   │   │   │   └── connection-test/
│   │   │   │       └── connection-test.component.ts
│   │   │   └── services/
│   │   │       └── sidebar.service.ts
│   │   ├── features/              # Feature modules
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       ├── login.component.ts
│   │   │   │       ├── login.component.html
│   │   │   │       └── login.component.css
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.css
│   │   │   ├── landing/
│   │   │   │   ├── landing.component.ts
│   │   │   │   ├── landing.component.html
│   │   │   │   └── landing.component.css
│   │   │   ├── admin/
│   │   │   │   ├── admin.routes.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.component.ts
│   │   │   │   │   ├── dashboard.component.html
│   │   │   │   │   └── dashboard.component.css
│   │   │   │   ├── manage-users/
│   │   │   │   │   ├── manage-users.component.ts
│   │   │   │   │   ├── manage-users.routes.ts
│   │   │   │   │   └── user-form/
│   │   │   │   ├── manage-roles/
│   │   │   │   │   ├── manage-roles.component.ts
│   │   │   │   │   └── manage-roles.routes.ts
│   │   │   │   └── manage-classifications/
│   │   │   │       ├── manage-classifications.component.ts
│   │   │   │       └── manage-classifications.routes.ts
│   │   │   ├── user/                # Unified user module for ENCODER and VIEWER roles
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── user-dashboard.component.ts
│   │   │   │   ├── entries/
│   │   │   │   │   ├── disbursement-list/
│   │   │   │   │   │   └── disbursement-list.component.ts
│   │   │   │   │   └── disbursement-form/
│   │   │   │   │       └── disbursement-form.component.ts
│   │   │   │   └── reports/
│   │   │   │       ├── reports.component.ts
│   │   │   │       ├── export-reports/
│   │   │   │       │   └── export-reports.component.ts
│   │   │   │       └── my-reports/
│   │   │   │           └── my-reports.component.ts
│   │   │   └── shared-features/
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

#### 2. Landing Module
- Public landing page
- System overview
- Login navigation

#### 3. Dashboard Module
- General dashboard components
- Shared dashboard utilities

#### 4. Admin Module (Admin only)
- User account management
- Role management
- Classification configuration
- System monitoring and settings
- Complete administrative control

#### 5. User Module (Unified for ENCODER and VIEWER roles)
- **Dashboard**: Role-based dashboard with statistics and quick actions
- **Entries**: Disbursement data entry and management (ENCODER access)
  - Disbursement list with filtering and sorting
  - Disbursement form for create/edit operations
- **Reports**: Comprehensive reporting system
  - Main reports with analytics and charts
  - Export functionality (PDF, Excel, CSV)
  - Personal report management for encoders
- **Role-based permissions**: Different access levels within the same module

## Technology Stack
- **Frontend**: Angular 20+ with TypeScript
- **Styling**: CSS3 with responsive design
- **State Management**: Angular Services
- **HTTP Client**: Angular HttpClient
- **Forms**: Reactive Forms
- **Routing**: Angular Router with Guards

## Security Features
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Secure API endpoints
- Audit logging

## Deployment Structure
- Cloud-hosted application
- Automated backup systems
- Environment-specific configurations
- CI/CD pipeline ready

This structure supports all user stories and requirements while maintaining scalability and security standards.