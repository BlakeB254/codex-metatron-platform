import api from './api';

export interface Tenant {
  id: string;
  name: string;
  api_key: string;
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
  settings: {
    features: {
      crm: boolean;
      billing: boolean;
      content: boolean;
      max_users: number;
    };
  };
  metadata: Record<string, any>;
}

export interface TenantStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  cancelled_tenants: number;
  by_tier: Record<string, number>;
}

export const tenantService = {
  // Get all tenants
  async getAllTenants(): Promise<Tenant[]> {
    const response = await api.get('/api/tenants');
    return response.data.tenants;
  },

  // Get single tenant
  async getTenant(tenantId: string): Promise<Tenant> {
    const response = await api.get(`/api/tenants/${tenantId}`);
    return response.data.tenant;
  },

  // Create new tenant
  async createTenant(data: {
    id: string;
    name: string;
    tier: string;
    settings?: any;
    metadata?: any;
  }): Promise<Tenant> {
    const response = await api.post('/api/tenants', data);
    return response.data.tenant;
  },

  // Update tenant
  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put(`/api/tenants/${tenantId}`, data);
    return response.data.tenant;
  },

  // Delete tenant
  async deleteTenant(tenantId: string): Promise<void> {
    await api.delete(`/api/tenants/${tenantId}`);
  },

  // Suspend tenant
  async suspendTenant(tenantId: string): Promise<Tenant> {
    const response = await api.post(`/api/tenants/${tenantId}/suspend`);
    return response.data.tenant;
  },

  // Reactivate tenant
  async reactivateTenant(tenantId: string): Promise<Tenant> {
    const response = await api.post(`/api/tenants/${tenantId}/reactivate`);
    return response.data.tenant;
  },

  // Get tenant statistics
  async getTenantStats(): Promise<TenantStats> {
    const response = await api.get('/api/tenants/stats');
    return response.data.stats;
  },

  // Reset tenant API key
  async resetApiKey(tenantId: string): Promise<{ api_key: string }> {
    const response = await api.post(`/api/tenants/${tenantId}/reset-api-key`);
    return response.data;
  },

  // Get tenant services
  async getTenantServices(tenantId: string): Promise<any[]> {
    const response = await api.get(`/api/tenants/${tenantId}/services`);
    return response.data.services;
  },

  // Update tenant service
  async updateTenantService(
    tenantId: string,
    serviceName: string,
    config: any
  ): Promise<void> {
    await api.put(`/api/tenants/${tenantId}/services/${serviceName}`, config);
  },
};