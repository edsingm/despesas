"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Tag,
  Building2,
  CreditCard,
  X,
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'Visão Geral',
      items: [
        {
          path: '/dashboard',
          icon: Home,
          label: 'Dashboard',
        },
      ]
    },
    {
      title: 'Transações',
      items: [
        {
          path: '/receitas',
          icon: TrendingUp,
          label: 'Receitas',
        },
        {
          path: '/despesas',
          icon: TrendingDown,
          label: 'Despesas',
        },
      ]
    },
    {
      title: 'Gestão',
      items: [
        {
          path: '/categorias',
          icon: Tag,
          label: 'Categorias',
        },
        {
          path: '/bancos',
          icon: Building2,
          label: 'Bancos',
        },
        {
          path: '/cartoes',
          icon: CreditCard,
          label: 'Cartões',
        },
      ]
    },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border/50 shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center h-16 px-6 border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-3 transition-all hover:opacity-90 active:scale-95">
            <div className="bg-primary text-primary-foreground flex items-center justify-center w-8 h-8 rounded-lg font-black text-[10px] tracking-tighter shadow-sm ring-1 ring-primary/20">
              SD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground leading-none">Sistema de</span>
              <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase mt-0.5">Despesas</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden ml-auto h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6 px-4">
          <nav className="space-y-8">
            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group overflow-hidden",
                          isActive 
                            ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                        )} />
                        {item.label}
                        
                        {isActive && (
                          <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        )}
                        
                        {!isActive && (
                          <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer (Optional) */}
        <div className="p-4 border-t border-border/40">
          <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
