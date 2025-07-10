import React from 'react';
import { BarChart3, Activity } from 'lucide-react';

interface SystemMetricsProps {
  refreshTrigger: number;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ refreshTrigger }) => {
  // Mock data for the chart - in production this would come from your metrics API
  const mockData = [
    { time: '00:00', cpu: 20, memory: 35, requests: 150 },
    { time: '04:00', cpu: 15, memory: 32, requests: 80 },
    { time: '08:00', cpu: 45, memory: 48, requests: 420 },
    { time: '12:00', cpu: 52, memory: 55, requests: 650 },
    { time: '16:00', cpu: 38, memory: 42, requests: 480 },
    { time: '20:00', cpu: 28, memory: 38, requests: 320 },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">System Metrics</h3>
          <div className="text-sm text-gray-400">(Last 24 hours)</div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {/* Simple ASCII-style chart for now - in production use a real charting library */}
        <div className="space-y-6">
          {/* CPU Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">CPU Usage</span>
              <span className="text-sm text-blue-400">Current: 23%</span>
            </div>
            <div className="space-y-1">
              {mockData.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-12">{point.time}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${point.cpu}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 w-8">{point.cpu}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Memory Usage</span>
              <span className="text-sm text-green-400">Current: 45%</span>
            </div>
            <div className="space-y-1">
              {mockData.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-12">{point.time}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${point.memory}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 w-8">{point.memory}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Request Volume</span>
              <span className="text-sm text-yellow-400">Peak: 650 req/min</span>
            </div>
            <div className="space-y-1">
              {mockData.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 w-12">{point.time}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(point.requests / 650) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 w-12">{point.requests}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">System Optimal</span>
            </div>
            <div className="text-xs text-gray-400">
              Auto-updated every 30 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};