import React from 'react';
import { Clock, User, Shield, Database, Server, Plus } from 'lucide-react';

interface Activity {
  id: string;
  type: 'tenant_created' | 'service_health' | 'admin_login' | 'database_backup' | 'api_key_generated';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  const iconMap = {
    tenant_created: <Plus className="w-4 h-4" />,
    service_health: <Server className="w-4 h-4" />,
    admin_login: <User className="w-4 h-4" />,
    database_backup: <Database className="w-4 h-4" />,
    api_key_generated: <Shield className="w-4 h-4" />,
  };

  return iconMap[type] || <Clock className="w-4 h-4" />;
};

interface RecentActivityProps {
  refreshTrigger: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ refreshTrigger }) => {
  // Mock data - in production this would come from your audit log API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'tenant_created',
      title: 'New tenant created',
      description: 'Tenant "Acme Corp" was successfully created with ID: tenant_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      user: 'superadmin@codexmetatron.com',
      severity: 'success',
    },
    {
      id: '2',
      type: 'service_health',
      title: 'Service health check completed',
      description: 'All 7 services are operational, average response time: 89ms',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      severity: 'info',
    },
    {
      id: '3',
      type: 'admin_login',
      title: 'Admin user logged in',
      description: 'User admin@client-demo.com accessed tenant dashboard',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      user: 'admin@client-demo.com',
      severity: 'info',
    },
    {
      id: '4',
      type: 'api_key_generated',
      title: 'API key regenerated',
      description: 'API key was regenerated for tenant "Demo Company"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      user: 'superadmin@codexmetatron.com',
      severity: 'warning',
    },
    {
      id: '5',
      type: 'database_backup',
      title: 'Database backup completed',
      description: 'Automated backup completed for 5 tenant databases',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      severity: 'success',
    },
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-400 bg-green-900/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'error':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-blue-400 bg-blue-900/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          <button className="text-sm text-yellow-500 hover:text-yellow-400">
            View All
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/80 transition-colors"
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg ${getSeverityStyles(activity.severity)}`}>
                <ActivityIcon type={activity.type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mt-1">
                  {activity.description}
                </p>
                
                {activity.user && (
                  <div className="flex items-center mt-2">
                    <User className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">{activity.user}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">
              Activity will appear here as users interact with the platform
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            Showing last {activities.length} activities
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <span className="sr-only">Refresh</span>
              🔄
            </button>
            <button className="text-gray-400 hover:text-white">
              <span className="sr-only">Filter</span>
              🔍
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};