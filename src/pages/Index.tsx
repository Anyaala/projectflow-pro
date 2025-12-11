import { useState } from 'react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProposals } from '@/hooks/useProposals';
import { Sidebar } from '@/components/tracker/Sidebar';
import { DashboardView } from '@/components/tracker/DashboardView';
import { KanbanView } from '@/components/tracker/KanbanView';
import { CalendarView } from '@/components/tracker/CalendarView';
import { GanttView } from '@/components/tracker/GanttView';
import { ProjectsView } from '@/components/tracker/ProjectsView';
import { ProposalsView } from '@/components/tracker/ProposalsView';
import { AnalyticsView } from '@/components/tracker/AnalyticsView';
import { ActivityView } from '@/components/tracker/ActivityView';
import { TaskDetailDrawer } from '@/components/tracker/TaskDetailDrawer';
import { Task } from '@/types/tracker';

export type ViewType = 'dashboard' | 'projects' | 'kanban' | 'gantt' | 'calendar' | 'proposals' | 'analytics' | 'activity';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(selectedProjectId);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals();

  const isLoading = metricsLoading || tasksLoading || projectsLoading || proposalsLoading;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView metrics={metrics} tasks={tasks} projects={projects} isLoading={isLoading} onTaskClick={handleTaskClick} />;
      case 'projects':
        return <ProjectsView projects={projects} tasks={tasks} isLoading={projectsLoading} onSelectProject={setSelectedProjectId} selectedProjectId={selectedProjectId} />;
      case 'kanban':
        return <KanbanView tasks={tasks} projects={projects} isLoading={tasksLoading} onTaskClick={handleTaskClick} selectedProjectId={selectedProjectId} onProjectChange={setSelectedProjectId} />;
      case 'gantt':
        return <GanttView tasks={tasks} projects={projects} isLoading={tasksLoading} onTaskClick={handleTaskClick} selectedProjectId={selectedProjectId} onProjectChange={setSelectedProjectId} />;
      case 'calendar':
        return <CalendarView tasks={tasks} isLoading={tasksLoading} onTaskClick={handleTaskClick} />;
      case 'proposals':
        return <ProposalsView proposals={proposals} projects={projects} isLoading={proposalsLoading} />;
      case 'analytics':
        return <AnalyticsView metrics={metrics} tasks={tasks} proposals={proposals} isLoading={isLoading} />;
      case 'activity':
        return <ActivityView />;
      default:
        return <DashboardView metrics={metrics} tasks={tasks} projects={projects} isLoading={isLoading} onTaskClick={handleTaskClick} />;
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
      <TaskDetailDrawer 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        projects={projects}
      />
    </div>
  );
};

export default Index;
