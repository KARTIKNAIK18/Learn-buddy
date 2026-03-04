import React from 'react';
import Sidebar from '../common/Sidebar';

/**
 * Standard layout for all role dashboards.
 * Sidebar (sticky) + scrollable main content area.
 */
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
