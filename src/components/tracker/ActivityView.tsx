import { useState, useMemo } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatDistanceToNow, parseISO, format, getYear, getMonth } from 'date-fns';
import { Activity, CheckCircle2, Edit, Plus, Trash2, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityLog } from '@/types/tracker';

const ACTION_ICONS: Record<string, React.ElementType> = {
  INSERT: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

interface GroupedLogs {
  [year: number]: {
    [month: number]: ActivityLog[];
  };
}

export function ActivityView() {
  const { data: logs = [], isLoading } = useActivityLogs(500);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group logs by year and month
  const { groupedLogs, years, months } = useMemo(() => {
    const grouped: GroupedLogs = {};
    const yearsSet = new Set<number>();
    
    logs.forEach((log) => {
      const date = parseISO(log.created_at);
      const year = getYear(date);
      const month = getMonth(date);
      
      yearsSet.add(year);
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(log);
    });

    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
    
    // Calculate months for selected year
    const monthsForYear = selectedYear !== 'all' && grouped[parseInt(selectedYear)] 
      ? Object.keys(grouped[parseInt(selectedYear)]).map(Number).sort((a, b) => b - a)
      : [];

    return { groupedLogs: grouped, years: sortedYears, months: monthsForYear };
  }, [logs, selectedYear]);

  // Filter logs based on selection
  const filteredGroupedLogs = useMemo(() => {
    if (selectedYear === 'all') return groupedLogs;
    const year = parseInt(selectedYear);
    return { [year]: groupedLogs[year] || {} };
  }, [groupedLogs, selectedYear]);

  const toggleMonth = (key: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMonths(newExpanded);
  };

  // Auto-expand current month on first load
  useMemo(() => {
    if (logs.length > 0 && expandedMonths.size === 0) {
      const now = new Date();
      const key = `${getYear(now)}-${getMonth(now)}`;
      setExpandedMonths(new Set([key]));
    }
  }, [logs.length]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground mt-1">Recent changes and updates grouped by time</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet. Start creating projects and tasks!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {Object.entries(filteredGroupedLogs)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([year, monthsData]) => (
                <div key={year} className="divide-y divide-border/20">
                  {Object.entries(monthsData as Record<number, ActivityLog[]>)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([month, monthLogs]) => {
                      const key = `${year}-${month}`;
                      const isExpanded = expandedMonths.has(key);
                      const logsArray = monthLogs as ActivityLog[];
                      const logCount = logsArray?.length || 0;
                      
                      return (
                        <Collapsible key={key} open={isExpanded}>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-4 h-auto hover:bg-muted/30 rounded-none"
                              onClick={() => toggleMonth(key)}
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="font-semibold">
                                  {monthNames[parseInt(month)]} {year}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                {logCount} {logCount === 1 ? 'activity' : 'activities'}
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="divide-y divide-border/20 bg-muted/10">
                              {logsArray?.map((log) => {
                                const Icon = ACTION_ICONS[log.action] || CheckCircle2;
                                const title = (log.details as Record<string, unknown>)?.title || (log.details as Record<string, unknown>)?.name || 'Unknown';
                                return (
                                  <div 
                                    key={log.id} 
                                    className="p-4 pl-12 flex items-start gap-4 hover:bg-muted/20 transition-colors"
                                  >
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                                      log.action === 'INSERT' ? 'bg-success/20 text-success' : 
                                      log.action === 'DELETE' ? 'bg-destructive/20 text-destructive' : 
                                      'bg-primary/20 text-primary'
                                    }`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium">
                                        {log.action === 'INSERT' && 'Created '}
                                        {log.action === 'UPDATE' && 'Updated '}
                                        {log.action === 'DELETE' && 'Deleted '}
                                        <span className="text-primary">{String(title)}</span>
                                        <span className="text-muted-foreground"> in {log.entity_type}</span>
                                      </p>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                        <span>{format(parseISO(log.created_at), 'MMM d, yyyy • h:mm a')}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}