import React, { useState, useEffect } from 'react';
import { Users, Server, Activity, Database, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../services/authService';

interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  healthyServices: number;
  totalServices: number;
  avgResponseTime: number;
  totalErrors: number;
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  status?: 'good' | 'warning' | 'error';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  status = 'good',
  subtitle 
}) => {
  const statusStyles = {
    good: 'border-green-500/30 bg-green-900/20',
    warning: 'border-yellow-500/30 bg-yellow-900/20',
    error: 'border-red-500/30 bg-red-900/20',
  };

  const statusTextColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  return (
    <div className={`bg-gray-800 rounded-lg border p-6 ${statusStyles[status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-gray-900 ${statusTextColors[status]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${
              trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{trend.value}%</span>
            </div>
            <p className="text-xs text-gray-500">{trend.period}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface SystemStatsCardsProps {
  refreshTrigger: number;
}

export const SystemStatsCards: React.FC<SystemStatsCardsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints in parallel
      const [tenantsResponse, servicesResponse, healthResponse] = await Promise.all([
        api.get('/api/tenants?limit=1'), // Just to get total count
        api.get('/api/services/stats'),
        api.get('/health/detailed'),
      ]);

      // Mock some data for now - in production this would come from your APIs
      const mockStats: SystemStats = {
        totalTenants: 127,
        activeTenants: 124,
        healthyServices: servicesResponse.data.services?.healthy || 7,
        totalServices: servicesResponse.data.services?.total || 7,
        avgResponseTime: servicesResponse.data.performance?.avgResponseTime || 89,
        totalErrors: servicesResponse.data.errors?.total || 3,
        uptime: '99.97%',
        memoryUsage: 45,
        cpuUsage: 23,
        storageUsage: 67,
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalTenants: 0,
        activeTenants: 0,
        healthyServices: 0,
        totalServices: 0,
        avgResponseTime: 0,
        totalErrors: 0,
        uptime: '0%',
        memoryUsage: 0,
        cpuUsage: 0,
        storageUsage: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const serviceHealthStatus = stats.healthyServices === stats.totalServices ? 'good' : 
                             stats.healthyServices > stats.totalServices * 0.7 ? 'warning' : 'error';

  const responseTimeStatus = stats.avgResponseTime < 200 ? 'good' : 
                           stats.avgResponseTime < 500 ? 'warning' : 'error';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Tenants */}
      <StatCard
        title="Total Tenants"
        value={stats.totalTenants}
        icon={<Users className="w-6 h-6" />}
        subtitle={`${stats.activeTenants} active`}
        trend={{
          value: 12,
          direction: 'up',
          period: 'vs last month'
        }}
        status="good"
      />

      {/* Service Health */}
      <StatCard
        title="Service Health"
        value={`${stats.healthyServices}/${stats.totalServices}`}
        icon={<Server className="w-6 h-6" />}
        subtitle="services operational"
        status={serviceHealthStatus}
      />

      {/* Average Response Time */}
      <StatCard
        title="Avg Response Time"
        value={`${stats.avgResponseTime}ms`}
        icon={<Activity className="w-6 h-6" />}
        subtitle="across all services"
        trend={{
          value: 5,
          direction: 'down',
          period: 'vs yesterday'
        }}
        status={responseTimeStatus}
      />

      {/* System Uptime */}
      <StatCard
        title="System Uptime"
        value={stats.uptime}
        icon={<Database className="w-6 h-6" />}
        subtitle="30-day average"
        status="good"
      />

      {/* Memory Usage */}
      <StatCard
        title="Memory Usage"
        value={`${stats.memoryUsage}%`}
        icon={<Activity className="w-6 h-6" />}
        subtitle="of allocated memory"
        status={stats.memoryUsage > 80 ? 'error' : stats.memoryUsage > 60 ? 'warning' : 'good'}
      />

      {/* CPU Usage */}
      <StatCard
        title="CPU Usage"
        value={`${stats.cpuUsage}%`}
        icon={<Activity className="w-6 h-6" />}
        subtitle="average load"
        status={stats.cpuUsage > 80 ? 'error' : stats.cpuUsage > 60 ? 'warning' : 'good'}
      />

      {/* Storage Usage */}
      <StatCard
        title="Storage Usage"
        value={`${stats.storageUsage}%`}
        icon={<Database className="w-6 h-6" />}
        subtitle="of total capacity"
        status={stats.storageUsage > 85 ? 'error' : stats.storageUsage > 70 ? 'warning' : 'good'}
      />

      {/* Total Errors */}
      <StatCard
        title="Error Count"
        value={stats.totalErrors}
        icon={<TrendingDown className="w-6 h-6" />}
        subtitle="last 24 hours"
        trend={{
          value: 25,
          direction: 'down',
          period: 'vs yesterday'
        }}
        status={stats.totalErrors > 10 ? 'error' : stats.totalErrors > 5 ? 'warning' : 'good'}
      />
    </div>
  );
};