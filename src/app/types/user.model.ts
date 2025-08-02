import { UserRole, Permission } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permission?: Permission; // Only for USER role, null for ADMIN
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permission?: Permission;
  department?: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  permission?: Permission;
  department?: string;
  isActive?: boolean;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: Date;
}



export interface UserPermissions {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewReports: boolean;
  canCreateDisbursements: boolean;
  canEditDisbursements: boolean;
  canDeleteDisbursements: boolean;
  canManageClassifications: boolean;
}