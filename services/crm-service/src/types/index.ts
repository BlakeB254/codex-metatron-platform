// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

// Customer types
export interface Customer extends BaseEntity {
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  website?: string;
  address?: Address;
  customFields?: Record<string, any>;
  assignedTo?: string; // User ID
  tags?: string[];
  source?: string;
  value?: number; // Customer lifetime value
}

// Lead types
export interface Lead extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  source: string;
  score?: number;
  assignedTo?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  notes?: string;
  convertedAt?: Date;
  convertedToCustomerId?: string;
}

// Contact types
export interface Contact extends BaseEntity {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary: boolean;
  status: 'active' | 'inactive';
  customFields?: Record<string, any>;
}

// Deal types
export interface Deal extends BaseEntity {
  title: string;
  description?: string;
  customerId: string;
  contactId?: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number; // 0-100
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  assignedTo?: string;
  source?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  lostReason?: string;
}

// Activity types
export interface Activity extends BaseEntity {
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'proposal';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  assignedTo: string;
  customerId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  duration?: number; // minutes
  outcome?: string;
  customFields?: Record<string, any>;
}

// Common types
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  permissions: string[];
}

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  plan: string;
  features: string[];
}

// Request types with auth context
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  tenant?: TenantContext;
}

// Analytics types
export interface CRMMetrics {
  totalCustomers: number;
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  pipelineValue: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}