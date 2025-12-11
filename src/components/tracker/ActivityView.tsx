import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Activity, CheckCircle2, Edit, Plus, Trash2 } from 'lucide-react';

const ACTION_ICONS: Record<string, React.ElementType> = {
  INSERT: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

export function ActivityView() {
  const { data: logs = [], isLoading } = useActivityLogs(100);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground mt-1">Recent changes and updates</p>
      </div>

      <div className="glass-card">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity yet. Start creating projects and tasks!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || CheckCircle2;
              const title = log.details?.title || log.details?.name || 'Unknown';
              return (
                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                  <div className={`p-2 rounded-lg ${log.action === 'INSERT' ? 'bg-success/20 text-success' : log.action === 'DELETE' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {log.action === 'INSERT' && 'Created '}
                      {log.action === 'UPDATE' && 'Updated '}
                      {log.action === 'DELETE' && 'Deleted '}
                      <span className="text-primary">{title}</span>
                      <span className="text-muted-foreground"> in {log.entity_type}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                    </p>
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
