import { DisbursementClassification } from './enums';

export interface Disbursement {
  id: string;
  payee: string;
  amount: number;
  disbursementDate: Date;
  fundSource: string;
  classification: DisbursementClassification;
  description: string;
  referenceNumber: string;
  department: string;
  encodedBy: string;
  encodedAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  isArchived: boolean;
  attachments?: DisbursementAttachment[];
}

export interface CreateDisbursementRequest {
  payee: string;
  amount: number;
  disbursementDate: Date;
  fundSource: string;
  classification: DisbursementClassification;
  description: string;
  referenceNumber: string;
  department: string;
  attachments?: File[];
}

export interface UpdateDisbursementRequest {
  payee?: string;
  amount?: number;
  disbursementDate?: Date;
  fundSource?: string;
  classification?: DisbursementClassification;
  description?: string;
  referenceNumber?: string;
  department?: string;
}

export interface DisbursementAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  url: string;
}

export interface DisbursementFilter {
  startDate?: Date;
  endDate?: Date;
  department?: string;
  classification?: DisbursementClassification;
  fundSource?: string;
  payee?: string;
  minAmount?: number;
  maxAmount?: number;
  encodedBy?: string;
}

export interface DisbursementSummary {
  totalAmount: number;
  totalCount: number;
  byClassification: Record<DisbursementClassification, number>;
  byDepartment: Record<string, number>;
  byFundSource: Record<string, number>;
}