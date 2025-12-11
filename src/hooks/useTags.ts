import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/types/tracker';
import { toast } from 'sonner';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Tag[];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tag: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .insert([tag])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tag: ' + error.message);
    },
  });
}

export function useTaskTags(taskId: string) {
  return useQuery({
    queryKey: ['task-tags', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_tags')
        .select(`
          tag:tags(*)
        `)
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data.map(t => t.tag) as Tag[];
    },
    enabled: !!taskId,
  });
}

export function useAddTagToTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { error } = await supabase
        .from('task_tags')
        .insert([{ task_id: taskId, tag_id: tagId }]);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-tags', variables.taskId] });
    },
    onError: (error) => {
      toast.error('Failed to add tag: ' + error.message);
    },
  });
}

export function useRemoveTagFromTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-tags', variables.taskId] });
    },
    onError: (error) => {
      toast.error('Failed to remove tag: ' + error.message);
    },
  });
}
