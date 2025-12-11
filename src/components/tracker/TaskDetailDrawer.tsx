import { useState } from 'react';
import { X, Calendar, Clock, User, Tag, MessageSquare, Paperclip, Trash2, Send } from 'lucide-react';
import { Task, Project, PRIORITY_LABELS, STATUS_LABELS, TaskPriority, TaskStatus } from '@/types/tracker';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useTaskComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useTaskTags, useTags, useAddTagToTask, useRemoveTagFromTask } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export function TaskDetailDrawer({ task, isOpen, onClose, projects }: TaskDetailDrawerProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: comments = [] } = useTaskComments(task?.id || '');
  const { data: taskTags = [] } = useTaskTags(task?.id || '');
  const { data: allTags = [] } = useTags();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const addTag = useAddTagToTask();
  const removeTag = useRemoveTagFromTask();

  if (!task) return null;

  const currentTask = { ...task, ...editedTask };

  const handleSave = () => {
    if (Object.keys(editedTask).length > 0) {
      updateTask.mutate({ id: task.id, ...editedTask });
      setEditedTask({});
    }
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    onClose();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      createComment.mutate({ task_id: task.id, content: newComment, author: 'User' });
      setNewComment('');
    }
  };

  const handleToggleTag = (tagId: string) => {
    const hasTag = taskTags.some(t => t?.id === tagId);
    if (hasTag) {
      removeTag.mutate({ taskId: task.id, tagId });
    } else {
      addTag.mutate({ taskId: task.id, tagId });
    }
  };

  const availableTags = allTags.filter(t => !taskTags.some(tt => tt?.id === t.id));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl glass-elevated border-border/50 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <Input
                value={currentTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
                placeholder="Task title"
              />
              <SheetDescription className="mt-1">
                Created {formatDistanceToNow(parseISO(task.created_at), { addSuffix: true })}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="details" className="p-6 space-y-6 m-0">
              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={currentTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Add a description..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={currentTask.status}
                    onValueChange={(v: TaskStatus) => setEditedTask({ ...editedTask, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={currentTask.priority}
                    onValueChange={(v: TaskPriority) => setEditedTask({ ...editedTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project */}
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select
                  value={currentTask.project_id || 'none'}
                  onValueChange={(v) => setEditedTask({ ...editedTask, project_id: v === 'none' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
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
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </label>
                  <Input
                    type="date"
                    value={currentTask.start_date || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due Date
                  </label>
                  <Input
                    type="date"
                    value={currentTask.due_date || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Time tracking */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Estimated Hours
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={currentTask.estimated_hours || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Actual Hours
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={currentTask.actual_hours || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, actual_hours: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Assigned to */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Assigned To
                </label>
                <Input
                  value={currentTask.assigned_to || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, assigned_to: e.target.value })}
                  placeholder="Enter name or email"
                />
              </div>
            </TabsContent>

            <TabsContent value="comments" className="p-6 space-y-4 m-0">
              {/* Add comment */}
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comment.author || 'Anonymous'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteComment.mutate({ id: comment.id, taskId: task.id })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="tags" className="p-6 space-y-4 m-0">
              {/* Current tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Current Tags</label>
                <div className="flex flex-wrap gap-2">
                  {taskTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags assigned</p>
                  ) : (
                    taskTags.map((tag) => tag && (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                        onClick={() => handleToggleTag(tag.id)}
                      >
                        {tag.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Available tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Add Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={Object.keys(editedTask).length === 0}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
