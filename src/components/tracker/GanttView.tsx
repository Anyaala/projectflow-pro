import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Project, PRIORITY_LABELS } from '@/types/tracker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, differenceInDays, startOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface GanttViewProps {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
  selectedProjectId?: string;
  onProjectChange: (projectId: string | undefined) => void;
}

export function GanttView({ tasks, projects, isLoading, onTaskClick, selectedProjectId, onProjectChange }: GanttViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Filter tasks that have start and due dates
  const ganttTasks = useMemo(() => {
    return tasks
      .filter(t => t.start_date || t.due_date)
      .sort((a, b) => {
        const aStart = a.start_date ? parseISO(a.start_date) : a.due_date ? parseISO(a.due_date) : new Date();
        const bStart = b.start_date ? parseISO(b.start_date) : b.due_date ? parseISO(b.due_date) : new Date();
        return aStart.getTime() - bStart.getTime();
      });
  }, [tasks]);

  const getTaskPosition = (task: Task) => {
    const taskStart = task.start_date ? parseISO(task.start_date) : task.due_date ? parseISO(task.due_date) : null;
    const taskEnd = task.due_date ? parseISO(task.due_date) : task.start_date ? addDays(parseISO(task.start_date), 1) : null;
    
    if (!taskStart || !taskEnd) return null;
    
    // Check if task overlaps with current month
    const taskStartDay = startOfDay(taskStart);
    const taskEndDay = startOfDay(taskEnd);
    
    if (taskEndDay < monthStart || taskStartDay > monthEnd) {
      return null; // Task doesn't overlap with current month
    }
    
    // Clamp task dates to current month boundaries
    const visibleStart = taskStartDay < monthStart ? monthStart : taskStartDay;
    const visibleEnd = taskEndDay > monthEnd ? monthEnd : taskEndDay;
    
    const dayWidth = 100 / days.length;
    const startDiff = differenceInDays(visibleStart, monthStart);
    const duration = differenceInDays(visibleEnd, visibleStart) + 1;
    
    const left = startDiff * dayWidth;
    const width = duration * dayWidth;
    
    return { 
      left: `${Math.max(0, left)}%`, 
      width: `${Math.max(width, dayWidth)}%`,
      startsBeforeMonth: taskStartDay < monthStart,
      endsAfterMonth: taskEndDay > monthEnd,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-priority-critical';
      case 'high': return 'bg-priority-high';
      case 'medium': return 'bg-priority-medium';
      case 'low': return 'bg-priority-low';
      default: return 'bg-primary';
    }
  };

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return '#06b6d4';
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#06b6d4';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gantt Chart</h1>
          <p className="text-muted-foreground mt-1">Visual timeline of your tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProjectId || 'all'} onValueChange={(v) => onProjectChange(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Header with days */}
        <div className="flex border-b border-border/50">
          <div className="w-64 flex-shrink-0 p-3 border-r border-border/50 bg-muted/30">
            <span className="font-medium text-sm">Task Name</span>
          </div>
          <div className="flex-1 flex">
            {days.map((day, i) => (
              <div
                key={i}
                className="flex-1 min-w-[30px] p-2 text-center text-xs border-r border-border/30 last:border-r-0"
                style={{ backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? 'hsl(var(--muted) / 0.3)' : 'transparent' }}
              >
                <div className="font-medium">{format(day, 'd')}</div>
                <div className="text-muted-foreground">{format(day, 'EEE')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task rows */}
        <div className="divide-y divide-border/30">
          {ganttTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No tasks with dates found. Add start and due dates to your tasks to see them here.</p>
            </div>
          ) : (
            ganttTasks.map((task) => {
              const position = getTaskPosition(task);
              const project = projects.find(p => p.id === task.project_id);
              return (
                <div key={task.id} className="flex hover:bg-muted/20 transition-colors">
                  <div 
                    className="w-64 flex-shrink-0 p-3 border-r border-border/50 cursor-pointer hover:bg-muted/30"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                      <span className="font-medium text-sm truncate">{task.title}</span>
                    </div>
                    {project && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                        <span className="text-xs text-muted-foreground">{project.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative min-h-[50px]">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {days.map((day, i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-[30px] border-r border-border/20 last:border-r-0"
                          style={{ backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? 'hsl(var(--muted) / 0.2)' : 'transparent' }}
                        />
                      ))}
                    </div>
                    {/* Task bar */}
                    {position && (
                      <div
                        className={cn(
                          "gantt-bar top-3 cursor-pointer",
                          position.startsBeforeMonth && "rounded-l-none",
                          position.endsAfterMonth && "rounded-r-none"
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          backgroundColor: getProjectColor(task.project_id),
                        }}
                        onClick={() => onTaskClick(task)}
                        title={`${task.title} - ${PRIORITY_LABELS[task.priority]}${task.start_date ? ` | Start: ${format(parseISO(task.start_date), 'MMM d')}` : ''}${task.due_date ? ` | Due: ${format(parseISO(task.due_date), 'MMM d')}` : ''}`}
                      >
                        <span className="text-xs text-primary-foreground px-2 truncate block leading-6">
                          {position.startsBeforeMonth ? '◀ ' : ''}{task.title}{position.endsAfterMonth ? ' ▶' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">Priority:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full priority-low" /><span>Low</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full priority-medium" /><span>Medium</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full priority-high" /><span>High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full priority-critical" /><span>Critical</span></div>
      </div>
    </div>
  );
}
