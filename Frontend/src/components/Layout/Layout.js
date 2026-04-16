import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
