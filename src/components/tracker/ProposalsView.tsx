import { useState } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { Proposal, Project, PROPOSAL_STAGE_LABELS, ProposalStage } from '@/types/tracker';
import { useCreateProposal, useUpdateProposal } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';

interface ProposalsViewProps {
  proposals: Proposal[];
  projects: Project[];
  isLoading: boolean;
}

const STAGE_ORDER: ProposalStage[] = ['draft', 'sent_to_client', 'client_review', 'negotiation', 'revision', 'approved', 'contract_signed'];

export function ProposalsView({ proposals, projects, isLoading }: ProposalsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({ title: '', client_name: '', value: '', project_id: '' });
  
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();

  const handleCreate = () => {
    if (newProposal.title.trim()) {
      createProposal.mutate({
        title: newProposal.title,
        client_name: newProposal.client_name,
        value: newProposal.value ? parseFloat(newProposal.value) : undefined,
        project_id: newProposal.project_id || undefined,
        draft_date: new Date().toISOString().split('T')[0],
      });
      setNewProposal({ title: '', client_name: '', value: '', project_id: '' });
      setIsCreateOpen(false);
    }
  };

  const advanceStage = (proposal: Proposal) => {
    const currentIndex = STAGE_ORDER.indexOf(proposal.stage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const newStage = STAGE_ORDER[currentIndex + 1];
      const dateField = `${newStage.replace('_', '')}_date` as keyof Proposal;
      updateProposal.mutate({
        id: proposal.id,
        stage: newStage,
        [dateField]: new Date().toISOString().split('T')[0],
      });
    }
  };

  const totalValue = proposals.reduce((sum, p) => sum + (p.value || 0), 0);
  const avgProbability = proposals.length > 0 
    ? proposals.reduce((sum, p) => sum + p.probability_to_close, 0) / proposals.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground mt-1">Track proposal lifecycle from draft to contract</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-elevated border-border/50">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Proposal title" value={newProposal.title} onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })} />
              <Input placeholder="Client name" value={newProposal.client_name} onChange={(e) => setNewProposal({ ...newProposal, client_name: e.target.value })} />
              <Input type="number" placeholder="Value ($)" value={newProposal.value} onChange={(e) => setNewProposal({ ...newProposal, value: e.target.value })} />
              <Select value={newProposal.project_id} onValueChange={(v) => setNewProposal({ ...newProposal, project_id: v })}>
                <SelectTrigger><SelectValue placeholder="Link to project (optional)" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full">Create Proposal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Avg. Close Probability</p>
              <p className="text-2xl font-bold">{avgProbability.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
              {proposals.length}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Proposals</p>
              <p className="text-2xl font-bold">{proposals.filter(p => p.stage !== 'contract_signed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold">All Proposals</h3>
        </div>
        <div className="divide-y divide-border/30">
          {proposals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No proposals yet. Create your first proposal to get started.
            </div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{proposal.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {proposal.client_name && <span>{proposal.client_name}</span>}
                      {proposal.value && <span>${proposal.value.toLocaleString()}</span>}
                      <span>{proposal.probability_to_close}% probability</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-muted">
                      {PROPOSAL_STAGE_LABELS[proposal.stage]}
                    </span>
                    {proposal.stage !== 'contract_signed' && (
                      <Button size="sm" variant="outline" onClick={() => advanceStage(proposal)}>
                        Advance
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
