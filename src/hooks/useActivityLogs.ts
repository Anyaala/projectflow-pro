import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types/tracker';
import { useEffect } from 'react';

export function useActivityLogs(limit = 50) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('activity-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
}

export function useEntityActivityLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['activity-logs', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!entityType && !!entityId,
  });
}
