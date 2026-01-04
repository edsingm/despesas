"use client";

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          user={user}
          onToggleSidebar={handleToggleSidebar}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
