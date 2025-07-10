import api from './api';

export interface ServiceHealth {
  id: number;
  name: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'maintenance';
  last_health_check: string | null;
  response_time_ms: number | null;
  error_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'error';
  response_time: number;
  error?: string;
  details?: any;
}

export const serviceHealthService = {
  // Get all services health status
  async getAllServicesHealth(): Promise<ServiceHealth[]> {
    const response = await api.get('/api/services/health');
    return response.data.services;
  },

  // Get single service health
  async getServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const response = await api.get(`/api/services/${serviceName}/health`);
    return response.data.service;
  },

  // Trigger health check for a service
  async checkServiceHealth(serviceName: string): Promise<HealthCheckResult> {
    const response = await api.post(`/api/services/${serviceName}/check`);
    return response.data.result;
  },

  // Trigger health check for all services
  async checkAllServicesHealth(): Promise<HealthCheckResult[]> {
    const response = await api.post('/api/services/check-all');
    return response.data.results;
  },

  // Update service status manually
  async updateServiceStatus(
    serviceName: string,
    status: 'healthy' | 'unhealthy' | 'maintenance'
  ): Promise<ServiceHealth> {
    const response = await api.put(`/api/services/${serviceName}/status`, { status });
    return response.data.service;
  },

  // Get service health history
  async getServiceHealthHistory(
    serviceName: string,
    hours: number = 24
  ): Promise<any[]> {
    const response = await api.get(`/api/services/${serviceName}/history`, {
      params: { hours },
    });
    return response.data.history;
  },

  // Get aggregate health metrics
  async getHealthMetrics(): Promise<{
    total_services: number;
    healthy_services: number;
    unhealthy_services: number;
    maintenance_services: number;
    average_response_time: number;
    total_errors_24h: number;
  }> {
    const response = await api.get('/api/services/metrics');
    return response.data.metrics;
  },
};