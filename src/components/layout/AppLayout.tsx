"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user: supabaseUser, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Adaptar usuário do Supabase para o tipo da aplicação
  const user = supabaseUser ? {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
    email: supabaseUser.email || '',
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || new Date().toISOString(),
    avatar: supabaseUser.user_metadata?.avatar_url
  } : null;

  const handleLogout = () => {
    signOut();
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
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
