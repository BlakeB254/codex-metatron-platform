import React from 'react';
import { Users, Building, Crown, TrendingUp } from 'lucide-react';

interface TenantQuickViewProps {
  refreshTrigger: number;
}

interface QuickTenant {
  id: string;
  name: string;
  tier: string;
  status: string;
  userCount: number;
  lastActive: string;
}

export const TenantQuickView: React.FC<TenantQuickViewProps> = ({ refreshTrigger }) => {
  // Mock data - in production this would come from your API
  const recentTenants: QuickTenant[] = [
    {
      id: 'tenant_001',
      name: 'Acme Corporation',
      tier: 'enterprise',
      status: 'active',
      userCount: 45,
      lastActive: '2 min ago'
    },
    {
      id: 'tenant_002',
      name: 'TechStart Inc',
      tier: 'premium',
      status: 'active',
      userCount: 12,
      lastActive: '15 min ago'
    },
    {
      id: 'tenant_003',
      name: 'Design Studio',
      tier: 'standard',
      status: 'active',
      userCount: 8,
      lastActive: '1 hour ago'
    },
    {
      id: 'tenant_004',
      name: 'Local Business',
      tier: 'free',
      status: 'active',
      userCount: 3,
      lastActive: '3 hours ago'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'text-purple-400 bg-purple-900/30';
      case 'premium': return 'text-yellow-400 bg-yellow-900/30';
      case 'standard': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise': return <Crown className="w-3 h-3" />;
      case 'premium': return <TrendingUp className="w-3 h-3" />;
      default: return <Building className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Recent Tenants</h3>
          </div>
          <button className="text-sm text-yellow-500 hover:text-yellow-400">
            View All
          </button>
        </div>
      </div>

      {/* Tenant List */}
      <div className="p-6">
        <div className="space-y-4">
          {recentTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {tenant.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getTierColor(tenant.tier)}`}>
                      <div className="flex items-center space-x-1">
                        {getTierIcon(tenant.tier)}
                        <span className="capitalize">{tenant.tier}</span>
                      </div>
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {tenant.userCount} users
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">
                  Last active
                </div>
                <div className="text-sm text-gray-300">
                  {tenant.lastActive}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">124</div>
            <div className="text-xs text-gray-400">Active Tenants</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">1,247</div>
            <div className="text-xs text-gray-400">Total Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};