import { FolderOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp, Target, Calendar, ArrowRight } from 'lucide-react';
import { DashboardMetrics, Project, Task, PRIORITY_LABELS, STATUS_LABELS } from '@/types/tracker';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DashboardViewProps {
  metrics?: DashboardMetrics;
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
}

export function DashboardView({ metrics, tasks, projects, isLoading, onTaskClick }: DashboardViewProps) {
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

  const today = new Date();
  const overdueTasks = tasks.filter(t => t.due_date && t.status !== 'completed' && isBefore(parseISO(t.due_date), today));
  const urgentTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').filter(t => t.status !== 'completed');
  const recentTasks = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);

  const statCards = [
    { label: 'Total Projects', value: metrics?.totalProjects || 0, icon: FolderOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Tasks', value: metrics?.activeTasks || 0, icon: Clock, color: 'text-status-in-progress', bg: 'bg-status-in-progress/10' },
    { label: 'Completed', value: metrics?.completedTasks || 0, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Overdue', value: metrics?.overdueTasks || 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress & Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Task Completion Rate</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{metrics?.completionRate.toFixed(1) || 0}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${metrics?.completionRate || 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics?.completedTasks || 0} of {(metrics?.activeTasks || 0) + (metrics?.completedTasks || 0)} tasks completed
            </p>
          </div>
        </div>

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
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500"
                style={{ width: `${metrics?.proposalConversionRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue & Urgent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold">Overdue Tasks</h3>
            </div>
            <span className="text-sm text-destructive font-medium">{overdueTasks.length} tasks</span>
          </div>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No overdue tasks! 🎉</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <span className="text-xs text-destructive">
                    {task.due_date && format(parseISO(task.due_date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">High Priority Tasks</h3>
            </div>
            <span className="text-sm text-warning font-medium">{urgentTasks.length} tasks</span>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No urgent tasks</p>
          ) : (
            <div className="space-y-2">
              {urgentTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full priority-${task.priority} text-primary-foreground`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tasks by Priority & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {metrics?.tasksByPriority.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full priority-${item.priority}`} />
                  <span className="text-sm capitalize">{PRIORITY_LABELS[item.priority]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
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
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full status-${item.status.replace('_', '-')}`} />
                  <span className="text-sm">{STATUS_LABELS[item.status]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
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

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Tasks</h3>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Create your first task!</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                    <div>
                      <span className="font-medium">{task.title}</span>
                      {project && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="text-xs text-muted-foreground">{project.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full status-${task.status.replace('_', '-')} text-primary-foreground`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
