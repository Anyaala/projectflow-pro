import { FolderOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { DashboardMetrics, Project, Task, PRIORITY_LABELS, STATUS_LABELS } from '@/types/tracker';
import { format, parseISO } from 'date-fns';

interface DashboardViewProps {
  metrics?: DashboardMetrics;
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
}

export function DashboardView({ metrics, tasks, projects, isLoading }: DashboardViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: metrics?.totalProjects || 0, icon: FolderOpen, color: 'text-primary' },
    { label: 'Active Tasks', value: metrics?.activeTasks || 0, icon: Clock, color: 'text-status-in-progress' },
    { label: 'Completed', value: metrics?.completedTasks || 0, icon: CheckCircle2, color: 'text-success' },
    { label: 'Overdue', value: metrics?.overdueTasks || 0, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Completion Rate</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{metrics?.completionRate.toFixed(1) || 0}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${metrics?.completionRate || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Proposal Conversion */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-semibold">Proposal Conversion</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">{metrics?.proposalConversionRate.toFixed(1) || 0}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                style={{ width: `${metrics?.proposalConversionRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by Priority & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {metrics?.tasksByPriority.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <span className="text-sm capitalize">{PRIORITY_LABELS[item.priority]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full priority-${item.priority}`}
                      style={{ width: `${(item.count / Math.max(tasks.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {metrics?.tasksByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm">{STATUS_LABELS[item.status]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full status-${item.status.replace('_', '-')}`}
                      style={{ width: `${(item.count / Math.max(tasks.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {metrics?.upcomingDeadlines && metrics.upcomingDeadlines.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {metrics.upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                  <span className="font-medium">{task.title}</span>
                </div>
                {task.due_date && (
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(task.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
