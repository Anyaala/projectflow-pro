import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, PRIORITY_LABELS } from '@/types/tracker';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, isLoading, onTaskClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), day);
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View tasks by due date</p>
        </div>
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
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0 bg-muted/30">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={index}
                className={`calendar-day min-h-[120px] ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : ''} ${isToday ? 'bg-primary/5' : ''}`}
              >
                <div className={`text-sm mb-2 font-medium ${isToday ? 'w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1.5 rounded cursor-pointer truncate priority-${task.priority} text-primary-foreground hover:opacity-80 transition-opacity`}
                      onClick={() => onTaskClick(task)}
                      title={`${task.title} - ${PRIORITY_LABELS[task.priority]}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-muted-foreground">Priority:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded priority-low" /><span>Low</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded priority-medium" /><span>Medium</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded priority-high" /><span>High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded priority-critical" /><span>Critical</span></div>
      </div>
    </div>
  );
}
