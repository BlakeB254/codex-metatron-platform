import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Server, 
  Settings, 
  Database,
  Activity,
  Shield,
  Globe
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-yellow-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      to: '/dashboard',
      icon: <BarChart3 size={20} />,
      label: 'Dashboard',
    },
    {
      to: '/tenants',
      icon: <Users size={20} />,
      label: 'Tenants',
    },
    {
      to: '/services',
      icon: <Server size={20} />,
      label: 'Services',
    },
    {
      to: '/monitoring',
      icon: <Activity size={20} />,
      label: 'Monitoring',
    },
    {
      to: '/database',
      icon: <Database size={20} />,
      label: 'Database',
    },
    {
      to: '/security',
      icon: <Shield size={20} />,
      label: 'Security',
    },
    {
      to: '/analytics',
      icon: <Globe size={20} />,
      label: 'Analytics',
    },
    {
      to: '/settings',
      icon: <Settings size={20} />,
      label: 'Settings',
    },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <nav className="p-4 space-y-2">
        {/* Platform Stats */}
        <div className="mb-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Platform Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Active Tenants</span>
              <span className="text-yellow-500 font-semibold">127</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Healthy Services</span>
              <span className="text-green-500 font-semibold">7/7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Uptime</span>
              <span className="text-blue-500 font-semibold">99.9%</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Create Tenant
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Run Health Check
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
              View System Logs
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};