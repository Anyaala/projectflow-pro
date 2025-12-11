import { useState } from 'react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProposals } from '@/hooks/useProposals';
import { Sidebar } from '@/components/tracker/Sidebar';
import { DashboardView } from '@/components/tracker/DashboardView';
import { KanbanView } from '@/components/tracker/KanbanView';
import { CalendarView } from '@/components/tracker/CalendarView';
import { ProposalsView } from '@/components/tracker/ProposalsView';
import { AnalyticsView } from '@/components/tracker/AnalyticsView';
import { ActivityView } from '@/components/tracker/ActivityView';

export type ViewType = 'dashboard' | 'kanban' | 'calendar' | 'proposals' | 'analytics' | 'activity';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals();

  const isLoading = metricsLoading || tasksLoading || projectsLoading || proposalsLoading;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView metrics={metrics} tasks={tasks} projects={projects} isLoading={isLoading} />;
      case 'kanban':
        return <KanbanView tasks={tasks} projects={projects} isLoading={tasksLoading} />;
      case 'calendar':
        return <CalendarView tasks={tasks} isLoading={tasksLoading} />;
      case 'proposals':
        return <ProposalsView proposals={proposals} projects={projects} isLoading={proposalsLoading} />;
      case 'analytics':
        return <AnalyticsView metrics={metrics} tasks={tasks} proposals={proposals} isLoading={isLoading} />;
      case 'activity':
        return <ActivityView />;
      default:
        return <DashboardView metrics={metrics} tasks={tasks} projects={projects} isLoading={isLoading} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 px-4 lg:px-8 max-w-7xl">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
