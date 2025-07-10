import React from 'react';

export const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Service Management</h1>
        <p className="text-gray-400 mt-1">
          Monitor and manage all platform microservices
        </p>
      </div>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
        <div className="text-center text-gray-400">
          <p className="text-lg">Service management interface coming soon...</p>
          <p className="text-sm mt-2">This will include detailed service monitoring, configuration, and management tools.</p>
        </div>
      </div>
    </div>
  );
};