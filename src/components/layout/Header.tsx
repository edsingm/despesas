"use client";

import { Menu, Bell, User as UserIcon, LogOut, Settings, HelpCircle } from 'lucide-react';
import { User } from '@/types';
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user: User | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, onLogout }) => {
  const userInitials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40 w-full transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden hover:bg-muted transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Sistema de Gestão</span>
            <span className="mx-2 text-border">/</span>
            <span className="capitalize">{typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || 'Dashboard' : 'Dashboard'}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-muted transition-all duration-200">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-background animate-pulse"></span>
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-muted">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-2 hover:bg-muted rounded-lg transition-all duration-200">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold leading-none">{user?.name?.split(' ')[0]}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-semibold leading-none text-foreground">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-1">
                <DropdownMenuItem className="flex items-center gap-3 py-2.5 px-3 cursor-pointer rounded-md transition-colors">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Meu Perfil</span>
                    <span className="text-[10px] text-muted-foreground">Ver informações da conta</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 py-2.5 px-3 cursor-pointer rounded-md transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Configurações</span>
                    <span className="text-[10px] text-muted-foreground">Preferências do sistema</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-1">
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="flex items-center gap-3 py-2.5 px-3 cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sair da conta</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
