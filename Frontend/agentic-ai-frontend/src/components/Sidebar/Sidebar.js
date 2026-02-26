import React from 'react';
import { NavLink } from 'react-router-dom';
import { Workflow, LayoutDashboard, Database, History, Settings, Cpu, Users } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/', icon: Workflow, label: 'Workflow Builder' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/memory', icon: Database, label: 'Memory Store' },
    { path: '/history', icon: History, label: 'Execution History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
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

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Priyanshu Nayak</p>
            <p className="text-xs text-gray-400">Frontend Developer</p>
            <p className="text-xs text-gray-500">Roll: 2315510154</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
