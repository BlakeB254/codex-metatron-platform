import api from './api';

export interface AuditLog {
  id: number;
  tenant_id: string | null;
  admin_id: number;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  tenant_id?: string;
  admin_id?: number;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const auditService = {
  // Get audit logs with filters
  async getAuditLogs(filters?: AuditLogFilters): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const response = await api.get('/api/audit', { params: filters });
    return response.data;
  },

  // Get audit log by ID
  async getAuditLog(logId: number): Promise<AuditLog> {
    const response = await api.get(`/api/audit/${logId}`);
    return response.data.log;
  },

  // Get audit logs for a specific tenant
  async getTenantAuditLogs(tenantId: string, filters?: Omit<AuditLogFilters, 'tenant_id'>): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const response = await api.get(`/api/tenants/${tenantId}/audit`, { params: filters });
    return response.data;
  },

  // Get audit logs for a specific admin
  async getAdminAuditLogs(adminId: number, filters?: Omit<AuditLogFilters, 'admin_id'>): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const response = await api.get(`/api/admins/${adminId}/audit`, { params: filters });
    return response.data;
  },

  // Export audit logs
  async exportAuditLogs(filters?: AuditLogFilters, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const response = await api.get('/api/audit/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get audit statistics
  async getAuditStats(period: 'day' | 'week' | 'month' = 'day'): Promise<{
    total_actions: number;
    actions_by_type: Record<string, number>;
    actions_by_admin: Record<string, number>;
    actions_by_resource: Record<string, number>;
    timeline: Array<{
      date: string;
      count: number;
    }>;
  }> {
    const response = await api.get('/api/audit/stats', { params: { period } });
    return response.data.stats;
  },
};