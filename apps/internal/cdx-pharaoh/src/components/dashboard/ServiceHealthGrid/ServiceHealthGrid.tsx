import React from 'react';
import { Card } from '../../ui';
import { useServiceHealth } from './hooks';
import { ServiceStatusBadge } from './subcomponents/ServiceStatusBadge';
import type { ServiceHealthGridProps } from './ServiceHealthGrid.types';

export const ServiceHealthGrid: React.FC<ServiceHealthGridProps> = ({ refreshTrigger }) => {
  const { services, loading, error } = useServiceHealth(refreshTrigger);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-500">Error loading service health: {error}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <Card key={service.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{service.name}</h3>
            <ServiceStatusBadge status={service.status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{service.type}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Response Time:</span>
              <span className={service.responseTime > 500 ? 'text-yellow-600' : 'text-green-600'}>
                {service.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">CPU Usage:</span>
              <span className={service.cpuUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                {service.cpuUsage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Memory Usage:</span>
              <span className={service.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                {service.memoryUsage}%
              </span>
            </div>
          </div>
          {service.error && (
            <p className="text-xs text-red-500 mt-2">{service.error}</p>
          )}
        </Card>
      ))}
    </div>
  );
};