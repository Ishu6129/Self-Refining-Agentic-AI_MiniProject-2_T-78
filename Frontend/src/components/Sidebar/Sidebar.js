import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Database, History, Settings, Cpu, Users } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/workspace', icon: LayoutDashboard, label: 'Workspace' },
    { path: '/dashboard', icon: Database, label: 'Dashboard' },
    { path: '/memory', icon: History, label: 'Memory Store' },
    { path: '/history', icon: Settings, label: 'Execution History' },
    { path: '/how-it-works', icon: Users, label: 'How It Works' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-dark-800 border-r border-dark-700 flex flex-col overflow-hidden`}>
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Agentic AI</h1>
            <p className="text-xs text-gray-400">T-78 Project</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
