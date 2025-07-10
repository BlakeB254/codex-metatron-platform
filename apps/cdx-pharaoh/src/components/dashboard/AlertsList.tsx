import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

interface AlertsListProps {
  refreshTrigger: number;
}

const AlertIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'error':
      return <XCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'success':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

export const AlertsList: React.FC<AlertsListProps> = ({ refreshTrigger }) => {
  // Mock alerts data - in production this would come from your monitoring system
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 80% on core-server',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      acknowledged: false,
      source: 'core-server'
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database maintenance scheduled for tonight at 2 AM EST',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      acknowledged: true,
      source: 'system'
    },
    {
      id: '3',
      type: 'success',
      title: 'Backup Completed',
      message: 'All tenant databases successfully backed up',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      acknowledged: true,
      source: 'backup-service'
    },
    {
      id: '4',
      type: 'error',
      title: 'Service Unavailable',
      message: 'billing-service is temporarily unavailable',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      acknowledged: false,
      source: 'billing-service'
    }
  ];

  const getAlertStyles = (type: string, acknowledged: boolean) => {
    const baseStyles = acknowledged ? 'opacity-60' : '';
    
    switch (type) {
      case 'error':
        return `${baseStyles} border-red-500/30 bg-red-900/20 text-red-400`;
      case 'warning':
        return `${baseStyles} border-yellow-500/30 bg-yellow-900/20 text-yellow-400`;
      case 'success':
        return `${baseStyles} border-green-500/30 bg-green-900/20 text-green-400`;
      default:
        return `${baseStyles} border-blue-500/30 bg-blue-900/20 text-blue-400`;
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

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">System Alerts</h3>
            {unacknowledgedCount > 0 && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          <button className="text-sm text-yellow-500 hover:text-yellow-400">
            Acknowledge All
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="text-gray-400">No alerts</p>
            <p className="text-sm text-gray-500 mt-1">
              All systems are running smoothly
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${getAlertStyles(alert.type, alert.acknowledged)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertIcon type={alert.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {alert.title}
                        {!alert.acknowledged && (
                          <span className="ml-2 w-2 h-2 bg-current rounded-full inline-block"></span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        {!alert.acknowledged && (
                          <button className="text-xs text-gray-400 hover:text-white">
                            Ack
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-1">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Source: {alert.source}
                      </span>
                      {alert.acknowledged && (
                        <span className="text-xs text-gray-500">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {alerts.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-gray-400">
                  Errors: <span className="text-red-400 font-medium">
                    {alerts.filter(a => a.type === 'error').length}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-400">
                  Warnings: <span className="text-yellow-400 font-medium">
                    {alerts.filter(a => a.type === 'warning').length}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="text-gray-400">
              Total: <span className="text-white font-medium">{alerts.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};