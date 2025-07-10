import api from './api';
import { SystemMetrics, DashboardStats, Notification, Alert } from '../types';

export const systemService = {
  // Get system configuration
  async getSystemConfig(): Promise<Record<string, any>> {
    const response = await api.get('/api/system/config');
    return response.data.config;
  },

  // Update system configuration
  async updateSystemConfig(key: string, value: any): Promise<void> {
    await api.put('/api/system/config', { key, value });
  },

  // Get system metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await api.get('/api/system/metrics');
    return response.data.metrics;
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/api/system/dashboard-stats');
    return response.data.stats;
  },

  // Get notifications
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    const response = await api.get('/api/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data.notifications;
  },

  // Mark notification as read
  async markNotificationRead(notificationId: number): Promise<void> {
    await api.put(`/api/notifications/${notificationId}/read`);
  },

  // Create notification
  async createNotification(notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    target_audience: 'admin' | 'superadmin' | 'all';
    expires_at?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    const response = await api.post('/api/notifications', notification);
    return response.data.notification;
  },

  // Get alerts
  async getAlerts(filters?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
  }): Promise<Alert[]> {
    const response = await api.get('/api/alerts', { params: filters });
    return response.data.alerts;
  },

  // Acknowledge alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    await api.put(`/api/alerts/${alertId}/acknowledge`);
  },

  // Resolve alert
  async resolveAlert(alertId: string): Promise<void> {
    await api.put(`/api/alerts/${alertId}/resolve`);
  },

  // Get system health summary
  async getSystemHealth(): Promise<{
    overall_health: number;
    services_health: number;
    database_health: number;
    api_health: number;
    issues: string[];
  }> {
    const response = await api.get('/api/system/health-summary');
    return response.data.health;
  },

  // Trigger system backup
  async triggerBackup(type: 'full' | 'incremental' = 'full'): Promise<{
    backup_id: string;
    status: string;
  }> {
    const response = await api.post('/api/system/backup', { type });
    return response.data;
  },

  // Get backup status
  async getBackupStatus(backupId: string): Promise<{
    backup_id: string;
    status: 'running' | 'completed' | 'failed';
    progress: number;
    error?: string;
  }> {
    const response = await api.get(`/api/system/backup/${backupId}/status`);
    return response.data;
  },

  // Enable/disable maintenance mode
  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    await api.put('/api/system/maintenance', { enabled, message });
  },

  // Get system logs
  async getSystemLogs(filters?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    service?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any[]> {
    const response = await api.get('/api/system/logs', { params: filters });
    return response.data.logs;
  },
};