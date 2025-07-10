// User and Auth Types
export interface User {
  id: number;
  email: string;
  role: 'superadmin' | 'admin';
  tenant_access: string[] | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  api_key: string;
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
  settings: TenantSettings;
  metadata: Record<string, any>;
  db_connection_string?: string;
}

export interface TenantSettings {
  features: {
    crm: boolean;
    billing: boolean;
    content: boolean;
    max_users: number;
  };
}

// Service Health Types
export interface ServiceHealth {
  id: number;
  name: string;
  endpoint: string;
  status: ServiceStatus;
  last_health_check: string | null;
  response_time_ms: number | null;
  error_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type ServiceStatus = 'healthy' | 'unhealthy' | 'unknown' | 'maintenance';

// System Metrics Types
export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  request_rate: number;
  error_rate: number;
  avg_response_time: number;
}

// Notification Types
export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  target_audience: 'admin' | 'superadmin' | 'all';
  is_read: boolean;
  expires_at: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

// Dashboard Types
export interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  monthly_revenue: number;
  system_health: number; // percentage
  active_alerts: number;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'system' | 'tenant' | 'service' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  resource_id?: string;
  resource_type?: string;
  created_at: string;
  resolved_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: number;
}

// Activity Types
export interface Activity {
  id: number;
  tenant_id?: string;
  admin_id?: number;
  admin_email?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filter Types
export interface FilterOptions {
  search?: string;
  status?: string;
  tier?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
}