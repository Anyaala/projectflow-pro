import { DashboardMetrics, Task, Proposal, PRIORITY_LABELS, STATUS_LABELS } from '@/types/tracker';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface AnalyticsViewProps {
  metrics?: DashboardMetrics;
  tasks: Task[];
  proposals: Proposal[];
  isLoading: boolean;
}

const PRIORITY_COLORS = ['#22c55e', '#f59e0b', '#f97316', '#ef4444'];
const STATUS_COLORS = ['#64748b', '#06b6d4', '#f59e0b', '#8b5cf6', '#22c55e'];

export function AnalyticsView({ metrics, tasks, proposals, isLoading }: AnalyticsViewProps) {
  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const priorityData = metrics.tasksByPriority.map((item, i) => ({
    name: PRIORITY_LABELS[item.priority],
    value: item.count,
    color: PRIORITY_COLORS[i],
  }));

  const statusData = metrics.tasksByStatus.map((item, i) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
    color: STATUS_COLORS[i],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into your project performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{metrics.completionRate.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-success">{metrics.proposalConversionRate.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-warning">{metrics.overdueTasks}</p>
          <p className="text-sm text-muted-foreground">Overdue Tasks</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold">{tasks.length}</p>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Tasks by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
