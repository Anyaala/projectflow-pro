import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Proposal, Project, PROPOSAL_STAGE_LABELS, ProposalStage } from '@/types/tracker';
import { useCreateProposal, useUpdateProposal } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ProposalsViewProps {
  proposals: Proposal[];
  projects: Project[];
  isLoading: boolean;
}

const STAGE_ORDER: ProposalStage[] = ['draft', 'sent_to_client', 'client_review', 'negotiation', 'revision', 'approved', 'contract_signed'];

interface NewProposalState {
  title: string;
  description: string;
  client_name: string;
  probability_to_close: number;
  project_id: string;
  stage: ProposalStage;
  draft_date: Date | undefined;
  sent_date: Date | undefined;
  review_date: Date | undefined;
  negotiation_date: Date | undefined;
  revision_date: Date | undefined;
  approval_date: Date | undefined;
  signed_date: Date | undefined;
}

const initialProposalState: NewProposalState = {
  title: '',
  description: '',
  client_name: '',
  probability_to_close: 50,
  project_id: '',
  stage: 'draft',
  draft_date: new Date(),
  sent_date: undefined,
  review_date: undefined,
  negotiation_date: undefined,
  revision_date: undefined,
  approval_date: undefined,
  signed_date: undefined,
};

export function ProposalsView({ proposals, projects, isLoading }: ProposalsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProposal, setNewProposal] = useState<NewProposalState>(initialProposalState);
  
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();

  const handleCreate = () => {
    if (newProposal.title.trim()) {
      createProposal.mutate({
        title: newProposal.title,
        description: newProposal.description || undefined,
        client_name: newProposal.client_name || undefined,
        probability_to_close: newProposal.probability_to_close,
        project_id: newProposal.project_id || undefined,
        stage: newProposal.stage,
        draft_date: newProposal.draft_date?.toISOString().split('T')[0],
        sent_date: newProposal.sent_date?.toISOString().split('T')[0],
        review_date: newProposal.review_date?.toISOString().split('T')[0],
        negotiation_date: newProposal.negotiation_date?.toISOString().split('T')[0],
        revision_date: newProposal.revision_date?.toISOString().split('T')[0],
        approval_date: newProposal.approval_date?.toISOString().split('T')[0],
        signed_date: newProposal.signed_date?.toISOString().split('T')[0],
      });
      setNewProposal(initialProposalState);
      setIsCreateOpen(false);
    }
  };

  const DatePickerField = ({ 
    label, 
    date, 
    onSelect 
  }: { 
    label: string; 
    date: Date | undefined; 
    onSelect: (date: Date | undefined) => void;
  }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-9 text-sm",
              !date && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-3 w-3" />
            {date ? format(date, "MMM d, yyyy") : "Select"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

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
          <DialogContent className="glass-elevated border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Proposal Title *</Label>
                  <Input 
                    placeholder="Enter proposal title" 
                    value={newProposal.title} 
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Enter proposal description" 
                    value={newProposal.description} 
                    onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input 
                    placeholder="Enter client name" 
                    value={newProposal.client_name} 
                    onChange={(e) => setNewProposal({ ...newProposal, client_name: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Probability to Close: {newProposal.probability_to_close}%</Label>
                  <Slider
                    value={[newProposal.probability_to_close]}
                    onValueChange={(v) => setNewProposal({ ...newProposal, probability_to_close: v[0] })}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={newProposal.project_id} onValueChange={(v) => setNewProposal({ ...newProposal, project_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Link to project (optional)" /></SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Stage</Label>
                  <Select value={newProposal.stage} onValueChange={(v) => setNewProposal({ ...newProposal, stage: v as ProposalStage })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      {STAGE_ORDER.map((stage) => (
                        <SelectItem key={stage} value={stage}>{PROPOSAL_STAGE_LABELS[stage]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lifecycle Dates */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Lifecycle Dates</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <DatePickerField 
                    label="Draft Date" 
                    date={newProposal.draft_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, draft_date: date })} 
                  />
                  <DatePickerField 
                    label="Sent to Client" 
                    date={newProposal.sent_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, sent_date: date })} 
                  />
                  <DatePickerField 
                    label="Client Review" 
                    date={newProposal.review_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, review_date: date })} 
                  />
                  <DatePickerField 
                    label="Negotiations" 
                    date={newProposal.negotiation_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, negotiation_date: date })} 
                  />
                  <DatePickerField 
                    label="Revision" 
                    date={newProposal.revision_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, revision_date: date })} 
                  />
                  <DatePickerField 
                    label="Approval" 
                    date={newProposal.approval_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, approval_date: date })} 
                  />
                  <DatePickerField 
                    label="Contract Signed" 
                    date={newProposal.signed_date} 
                    onSelect={(date) => setNewProposal({ ...newProposal, signed_date: date })} 
                  />
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={!newProposal.title.trim()}>
                Create Proposal
              </Button>
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
