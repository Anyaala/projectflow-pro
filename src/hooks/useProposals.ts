import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Proposal, ProposalStage } from '@/types/tracker';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useProposals() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('proposals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['proposals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Proposal[];
    },
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Proposal | null;
    },
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposal: { 
      title: string; 
      client_name?: string;
      client_email?: string;
      value?: number;
      project_id?: string;
      stage?: ProposalStage;
      probability_to_close?: number;
      draft_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert([proposal])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create proposal: ' + error.message);
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proposal> & { id: string }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update proposal: ' + error.message);
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete proposal: ' + error.message);
    },
  });
}
