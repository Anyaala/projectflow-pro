import { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Project, Task } from '@/types/tracker';
import { useCreateProject, useDeleteProject, useUpdateProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, parseISO, isBefore } from 'date-fns';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  isLoading: boolean;
  onSelectProject: (projectId: string | undefined) => void;
  selectedProjectId?: string;
}

export function ProjectsView({ projects, tasks, isLoading, onSelectProject, selectedProjectId }: ProjectsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#06b6d4', start_date: '', end_date: '' });
  
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const handleCreate = () => {
    if (newProject.name.trim()) {
      createProject.mutate({
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        start_date: newProject.start_date || undefined,
        end_date: newProject.end_date || undefined,
      });
      setNewProject({ name: '', description: '', color: '#06b6d4', start_date: '', end_date: '' });
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingProject && editingProject.name.trim()) {
      updateProject.mutate({
        id: editingProject.id,
        name: editingProject.name,
        description: editingProject.description,
        color: editingProject.color,
        start_date: editingProject.start_date,
        end_date: editingProject.end_date,
      });
      setEditingProject(null);
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    const overdue = projectTasks.filter(t => t.due_date && t.status !== 'completed' && isBefore(parseISO(t.due_date), new Date())).length;
    const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
    return { total, completed, overdue, inProgress, progress: total > 0 ? (completed / total) * 100 : 0 };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track your projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-elevated border-border/50">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to organize your work.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Project name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              <Textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <Input type="date" value={newProject.start_date} onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <Input type="date" value={newProject.end_date} onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#ef4444'].map((c) => (
                    <button key={c} onClick={() => setNewProject({ ...newProject, color: c })} className={cn('w-8 h-8 rounded-full', newProject.color === c && 'ring-2 ring-offset-2 ring-offset-background ring-primary')} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newProject.name.trim()}>Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={!selectedProjectId ? 'default' : 'outline'} size="sm" onClick={() => onSelectProject(undefined)}>All Projects</Button>
        {projects.map(p => (
          <Button key={p.id} variant={selectedProjectId === p.id ? 'default' : 'outline'} size="sm" onClick={() => onSelectProject(p.id)} className="gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full glass-card p-8 text-center">
            <p className="text-muted-foreground">No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          projects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <div key={project.id} className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer" onClick={() => onSelectProject(project.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                    <h3 className="font-semibold">{project.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteProject.mutate(project.id); }} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {project.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>}
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{stats.progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats.progress}%`, backgroundColor: project.color }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{stats.completed}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{stats.inProgress}</span>
                  </div>
                  {stats.overdue > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{stats.overdue}</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                {(project.start_date || project.end_date) && (
                  <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                    {project.start_date && <span>{format(parseISO(project.start_date), 'MMM d')}</span>}
                    {project.start_date && project.end_date && <span> - </span>}
                    {project.end_date && <span>{format(parseISO(project.end_date), 'MMM d, yyyy')}</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="glass-elevated border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 pt-4">
              <Input placeholder="Project name" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} />
              <Textarea placeholder="Description" value={editingProject.description || ''} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <Input type="date" value={editingProject.start_date || ''} onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <Input type="date" value={editingProject.end_date || ''} onChange={(e) => setEditingProject({ ...editingProject, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#ef4444'].map((c) => (
                    <button key={c} onClick={() => setEditingProject({ ...editingProject, color: c })} className={cn('w-8 h-8 rounded-full', editingProject.color === c && 'ring-2 ring-offset-2 ring-offset-background ring-primary')} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdate} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
