import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardMetrics, Task, TaskPriority, TaskStatus } from '@/types/tracker';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const today = new Date();
      const upcomingDate = addDays(today, 7);

      // Fetch all required data in parallel
      const [projectsRes, tasksRes, proposalsRes] = await Promise.all([
        supabase.from('projects').select('id, is_active'),
        supabase.from('tasks').select('*'),
        supabase.from('proposals').select('stage'),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (proposalsRes.error) throw proposalsRes.error;

      const projects = projectsRes.data;
      const tasks = tasksRes.data as Task[];
      const proposals = proposalsRes.data;

      // Calculate metrics
      const totalProjects = projects.length;
      const activeTasks = tasks.filter(t => t.status !== 'completed').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      
      const overdueTasks = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return isBefore(parseISO(t.due_date), today);
      }).length;

      const upcomingDeadlines = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        const dueDate = parseISO(t.due_date);
        return isAfter(dueDate, today) && isBefore(dueDate, upcomingDate);
      }).slice(0, 5);

      // Tasks by priority
      const priorityCounts: Record<TaskPriority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
      tasks.forEach(t => {
        if (t.priority) priorityCounts[t.priority]++;
      });
      const tasksByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority: priority as TaskPriority,
        count,
      }));

      // Tasks by status
      const statusCounts: Record<TaskStatus, number> = {
        not_started: 0,
        in_progress: 0,
        on_hold: 0,
        review: 0,
        completed: 0,
      };
      tasks.forEach(t => {
        if (t.status) statusCounts[t.status]++;
      });
      const tasksByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status as TaskStatus,
        count,
      }));

      // Proposal conversion rate
      const signedProposals = proposals.filter(p => p.stage === 'contract_signed').length;
      const proposalConversionRate = proposals.length > 0 
        ? (signedProposals / proposals.length) * 100 
        : 0;

      // Completion rate
      const completionRate = tasks.length > 0 
        ? (completedTasks / tasks.length) * 100 
        : 0;

      return {
        totalProjects,
        activeTasks,
        completedTasks,
        overdueTasks,
        upcomingDeadlines,
        tasksByPriority,
        tasksByStatus,
        proposalConversionRate,
        completionRate,
      };
    },
  });
}
