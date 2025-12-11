import { LayoutDashboard, Kanban, Calendar, FileText, BarChart3, Activity, FolderOpen, Plus } from 'lucide-react';
import { ViewType } from '@/pages/Index';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border/50 bg-sidebar flex flex-col" style={{ background: 'var(--gradient-sidebar)' }}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">ProjectFlow</h1>
            <p className="text-xs text-muted-foreground">Advanced Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button className="w-full gap-2" size="sm">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
