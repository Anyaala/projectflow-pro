export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'not_started' | 'in_progress' | 'on_hold' | 'review' | 'completed';
export type ProposalStage = 'draft' | 'sent_to_client' | 'client_review' | 'negotiation' | 'revision' | 'approved' | 'contract_signed';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  depends_on?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  tags?: Tag[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  client_name?: string;
  client_email?: string;
  value?: number;
  stage: ProposalStage;
  probability_to_close: number;
  draft_date?: string;
  sent_date?: string;
  review_date?: string;
  negotiation_date?: string;
  revision_date?: string;
  approval_date?: string;
  signed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details?: Record<string, any>;
  actor?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: Task[];
  tasksByPriority: { priority: TaskPriority; count: number }[];
  tasksByStatus: { status: TaskStatus; count: number }[];
  proposalConversionRate: number;
  completionRate: number;
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  review: 'Review',
  completed: 'Completed',
};

export const PROPOSAL_STAGE_LABELS: Record<ProposalStage, string> = {
  draft: 'Draft',
  sent_to_client: 'Sent to Client',
  client_review: 'Client Review',
  negotiation: 'Negotiation',
  revision: 'Revision',
  approved: 'Approved',
  contract_signed: 'Contract Signed',
};

export const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'not_started', title: 'Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'completed', title: 'Completed' },
];
