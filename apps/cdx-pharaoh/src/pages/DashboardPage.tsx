import React, { useState, useEffect } from 'react';
import { ServiceHealthGrid } from '../components/dashboard/ServiceHealthGrid';
import { SystemStatsCards } from '../components/dashboard/SystemStatsCards';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { TenantQuickView } from '../components/dashboard/TenantQuickView';
import { SystemMetrics } from '../components/dashboard/SystemMetrics';
import { AlertsList } from '../components/dashboard/AlertsList';

export const DashboardPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Real-time platform monitoring and management
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-medium rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* System Stats Cards */}
      <SystemStatsCards refreshTrigger={refreshTrigger} />

      {/* Service Health Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Service Health Monitor</h2>
        <ServiceHealthGrid refreshTrigger={refreshTrigger} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Metrics Chart */}
        <div className="lg:col-span-1">
          <SystemMetrics refreshTrigger={refreshTrigger} />
        </div>

        {/* Alerts and Notifications */}
        <div className="lg:col-span-1">
          <AlertsList refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Recent Activity and Quick Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity refreshTrigger={refreshTrigger} />
        </div>

        {/* Tenant Quick View */}
        <div className="lg:col-span-1">
          <TenantQuickView refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">All Systems Operational</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-sm text-gray-400">
              Platform uptime: 99.97% (30 days)
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-gray-400">
              CPU: <span className="text-blue-400">23%</span>
            </div>
            <div className="text-gray-400">
              Memory: <span className="text-green-400">45%</span>
            </div>
            <div className="text-gray-400">
              Storage: <span className="text-yellow-400">67%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};