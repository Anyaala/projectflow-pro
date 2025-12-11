import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority, KANBAN_COLUMNS, PRIORITY_LABELS } from '@/types/tracker';
import { useUpdateTaskStatus, useCreateTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
  selectedProjectId?: string;
  onProjectChange: (projectId: string | undefined) => void;
}

export function KanbanView({ tasks, projects, isLoading, onTaskClick, selectedProjectId, onProjectChange }: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    project_id: '', 
    priority: 'medium' as TaskPriority,
    start_date: '',
    due_date: '',
    assigned_to: '',
    estimated_hours: ''
  });
  
  const updateStatus = useUpdateTaskStatus();
  const createTask = useCreateTask();

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      updateStatus.mutate({ id: draggedTask, status });
      setDraggedTask(null);
    }
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTask.mutate({
        title: newTask.title,
        description: newTask.description || undefined,
        project_id: newTask.project_id || selectedProjectId || undefined,
        priority: newTask.priority,
        status: 'not_started',
        start_date: newTask.start_date || undefined,
        due_date: newTask.due_date || undefined,
        assigned_to: newTask.assigned_to || undefined,
        estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : undefined,
      });
      setNewTask({ title: '', description: '', project_id: '', priority: 'medium', start_date: '', due_date: '', assigned_to: '', estimated_hours: '' });
      setIsCreateOpen(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">Drag and drop to update task status</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProjectId || 'all'} onValueChange={(v) => onProjectChange(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-elevated border-border/50 max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task with all details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Task title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newTask.project_id || selectedProjectId || 'none'} onValueChange={(v) => setNewTask({ ...newTask, project_id: v === 'none' ? '' : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newTask.priority} onValueChange={(v: TaskPriority) => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Start Date</label>
                    <Input type="date" value={newTask.start_date} onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Due Date</label>
                    <Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Assigned to" value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} />
                  <Input type="number" placeholder="Est. hours" value={newTask.estimated_hours} onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })} />
                </div>
                <Button onClick={handleCreateTask} className="w-full" disabled={!newTask.title.trim()}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="glass-card p-4 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full status-${column.id.replace('_', '-')}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                </div>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const project = projects.find(p => p.id === task.project_id);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onClick={() => onTaskClick(task)}
                      className="kanban-card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <div className={`w-2 h-2 rounded-full priority-${task.priority}`} />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                      )}
                      {project && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="text-xs text-muted-foreground">{project.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{PRIORITY_LABELS[task.priority]}</span>
                        {task.due_date && (
                          <span>{format(parseISO(task.due_date), 'MMM d')}</span>
                        )}
                      </div>
                      {task.assigned_to && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          👤 {task.assigned_to}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
