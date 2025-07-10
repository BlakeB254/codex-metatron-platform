import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/authService';

interface Service {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'maintenance';
  endpoint: string;
  last_health_check: string;
  response_time_ms: number;
  error_count: number;
}

interface ServiceHealthGridProps {
  refreshTrigger: number;
}

const ServiceStatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'unhealthy':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'maintenance':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

const ServiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    healthy: 'bg-green-900/50 text-green-400 border-green-500',
    unhealthy: 'bg-red-900/50 text-red-400 border-red-500',
    maintenance: 'bg-yellow-900/50 text-yellow-400 border-yellow-500',
    unknown: 'bg-gray-900/50 text-gray-400 border-gray-500',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[status] || styles.unknown}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const ServiceHealthGrid: React.FC<ServiceHealthGridProps> = ({ refreshTrigger }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [refreshTrigger]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/services/health');
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch service health data');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    try {
      setLoading(true);
      await api.post('/api/services/health/check');
      await fetchServices();
    } catch (err) {
      setError('Failed to run health check');
      console.error('Error running health check:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading service health data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Service Health Monitor</h3>
            {loading && (
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Run Health Check
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="p-6">
        {services.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Server className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-gray-900 rounded-lg border border-gray-600 p-4 hover:border-gray-500 transition-colors"
              >
                {/* Service Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ServiceStatusIcon status={service.status} />
                    <h4 className="font-semibold text-white capitalize">
                      {service.name.replace('-', ' ')}
                    </h4>
                  </div>
                  <ServiceStatusBadge status={service.status} />
                </div>

                {/* Service Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Time</span>
                    <span className={`font-medium ${
                      service.response_time_ms < 200 ? 'text-green-400' :
                      service.response_time_ms < 500 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {service.response_time_ms}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error Count</span>
                    <span className={`font-medium ${
                      service.error_count === 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {service.error_count}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Check</span>
                    <span className="text-gray-300">
                      {service.last_health_check ? 
                        new Date(service.last_health_check).toLocaleTimeString() : 
                        'Never'
                      }
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700">
                    <span className="text-gray-400 text-xs">Endpoint:</span>
                    <div className="text-gray-300 text-xs font-mono truncate">
                      {service.endpoint}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {services.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">
                  Healthy: <span className="text-green-400 font-medium">
                    {services.filter(s => s.status === 'healthy').length}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-400">
                  Unhealthy: <span className="text-red-400 font-medium">
                    {services.filter(s => s.status === 'unhealthy').length}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">
                  Unknown: <span className="text-gray-400 font-medium">
                    {services.filter(s => s.status === 'unknown').length}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="text-gray-400">
              Total Services: <span className="text-white font-medium">{services.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};