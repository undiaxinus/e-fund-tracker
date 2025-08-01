export enum UserRole {
  ADMIN = 'admin',
  ENCODER = 'encoder',
  VIEWER = 'viewer'
}

export enum DisbursementClassification {
  PS = 'PS',     // Personnel Services
  MOOE = 'MOOE', // Maintenance and Other Operating Expenses
  CO = 'CO',     // Capital Outlay
  TR = 'TR'      // Trust Receipts
}

export enum ReportType {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  BY_CLASSIFICATION = 'by_classification',
  BY_DEPARTMENT = 'by_department',
  BY_FUND_SOURCE = 'by_fund_source'
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum DateRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}