import { useState } from 'react';
import { Calendar, Trash2, Check, Circle } from 'lucide-react';
import { Proposal, Project, PROPOSAL_STAGE_LABELS, ProposalStage } from '@/types/tracker';
import { useUpdateProposal, useDeleteProposal } from '@/hooks/useProposals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProposalDetailDrawerProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

const STAGE_ORDER: ProposalStage[] = ['draft', 'sent_to_client', 'client_review', 'negotiation', 'revision', 'approved', 'contract_signed'];

const STAGE_DATE_FIELDS: Record<ProposalStage, keyof Proposal> = {
  draft: 'draft_date',
  sent_to_client: 'sent_date',
  client_review: 'review_date',
  negotiation: 'negotiation_date',
  revision: 'revision_date',
  approved: 'approval_date',
  contract_signed: 'signed_date',
};

export function ProposalDetailDrawer({ proposal, isOpen, onClose, projects }: ProposalDetailDrawerProps) {
  const [editedProposal, setEditedProposal] = useState<Partial<Proposal>>({});
  
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();

  if (!proposal) return null;

  const currentProposal = { ...proposal, ...editedProposal };

  const handleSave = () => {
    if (Object.keys(editedProposal).length > 0) {
      updateProposal.mutate({ id: proposal.id, ...editedProposal });
      setEditedProposal({});
    }
  };

  const handleDelete = () => {
    deleteProposal.mutate(proposal.id);
    onClose();
  };

  const getStageIndex = (stage: ProposalStage) => STAGE_ORDER.indexOf(stage);
  const currentStageIndex = getStageIndex(currentProposal.stage);

  const DatePickerField = ({ 
    label, 
    dateKey,
    disabled = false,
  }: { 
    label: string; 
    dateKey: keyof Proposal;
    disabled?: boolean;
  }) => {
    const dateValue = editedProposal[dateKey] !== undefined 
      ? editedProposal[dateKey] 
      : proposal[dateKey];
    const date = dateValue ? (typeof dateValue === 'string' ? parseISO(dateValue) : undefined) : undefined;
    
    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-9 text-sm",
                !date && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-3 w-3" />
              {date ? format(date, "MMM d, yyyy") : "Not set"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => setEditedProposal({ 
                ...editedProposal, 
                [dateKey]: newDate?.toISOString().split('T')[0] 
              })}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl glass-elevated border-border/50 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <Input
                value={currentProposal.title}
                onChange={(e) => setEditedProposal({ ...editedProposal, title: e.target.value })}
                className="text-xl font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
                placeholder="Proposal title"
              />
              <SheetDescription className="mt-1">
                Created {formatDistanceToNow(parseISO(proposal.created_at), { addSuffix: true })}
                {proposal.client_name && ` • ${proposal.client_name}`}
              </SheetDescription>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
              {PROPOSAL_STAGE_LABELS[currentProposal.stage]}
            </span>
          </div>
        </SheetHeader>

        <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dates">Dates</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Timeline Tab */}
            <TabsContent value="timeline" className="p-6 m-0">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold mb-6">Proposal Lifecycle</h3>
                
                <div className="relative">
                  {STAGE_ORDER.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const dateField = STAGE_DATE_FIELDS[stage];
                    const stageDate = proposal[dateField] as string | undefined;
                    
                    return (
                      <div key={stage} className="flex items-start gap-4 pb-8 last:pb-0">
                        {/* Timeline line and dot */}
                        <div className="relative flex flex-col items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                            isCompleted && "bg-success border-success text-success-foreground",
                            isCurrent && "bg-primary border-primary text-primary-foreground animate-pulse",
                            !isCompleted && !isCurrent && "bg-muted border-border text-muted-foreground"
                          )}>
                            {isCompleted ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </div>
                          {index < STAGE_ORDER.length - 1 && (
                            <div className={cn(
                              "absolute top-8 w-0.5 h-full -z-0",
                              isCompleted ? "bg-success" : "bg-border"
                            )} />
                          )}
                        </div>
                        
                        {/* Stage content */}
                        <div className={cn(
                          "flex-1 pb-4",
                          isCurrent && "bg-primary/5 -mx-2 px-2 py-2 rounded-lg"
                        )}>
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              "font-medium",
                              isCompleted && "text-success",
                              isCurrent && "text-primary",
                              !isCompleted && !isCurrent && "text-muted-foreground"
                            )}>
                              {PROPOSAL_STAGE_LABELS[stage]}
                            </h4>
                            {stageDate && (
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(stageDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          
                          {isCurrent && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Current stage
                            </p>
                          )}
                          
                          {isCompleted && stageDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Completed {formatDistanceToNow(parseISO(stageDate), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage advancement */}
                {currentProposal.stage !== 'contract_signed' && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <Button 
                      className="w-full"
                      disabled={updateProposal.isPending}
                      onClick={() => {
                        const nextStage = STAGE_ORDER[currentStageIndex + 1];
                        const dateField = STAGE_DATE_FIELDS[nextStage];
                        updateProposal.mutate({
                          id: proposal.id,
                          stage: nextStage,
                          [dateField]: new Date().toISOString().split('T')[0],
                        });
                      }}
                    >
                      {updateProposal.isPending ? 'Advancing...' : `Advance to ${PROPOSAL_STAGE_LABELS[STAGE_ORDER[currentStageIndex + 1]]}`}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="p-6 space-y-6 m-0">
              <div>
                <Label className="mb-2 block">Description</Label>
                <Textarea
                  value={currentProposal.description || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, description: e.target.value })}
                  placeholder="Add a description..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label className="mb-2 block">Client Name</Label>
                <Input
                  value={currentProposal.client_name || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, client_name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <Label className="mb-2 block">Client Email</Label>
                <Input
                  type="email"
                  value={currentProposal.client_email || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, client_email: e.target.value })}
                  placeholder="Enter client email"
                />
              </div>

              <div>
                <Label className="mb-2 block">Value ($)</Label>
                <Input
                  type="number"
                  value={currentProposal.value || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, value: parseFloat(e.target.value) || undefined })}
                  placeholder="Enter proposal value"
                />
              </div>

              <div>
                <Label className="mb-2 block">
                  Probability to Close: {currentProposal.probability_to_close}%
                </Label>
                <Slider
                  value={[currentProposal.probability_to_close]}
                  onValueChange={(v) => setEditedProposal({ ...editedProposal, probability_to_close: v[0] })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="mb-2 block">Project</Label>
                <Select
                  value={currentProposal.project_id || 'none'}
                  onValueChange={(v) => setEditedProposal({ ...editedProposal, project_id: v === 'none' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
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

              <div>
                <Label className="mb-2 block">Current Stage</Label>
                <Select
                  value={currentProposal.stage}
                  onValueChange={(v) => setEditedProposal({ ...editedProposal, stage: v as ProposalStage })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {STAGE_ORDER.map((stage) => (
                      <SelectItem key={stage} value={stage}>{PROPOSAL_STAGE_LABELS[stage]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Notes</Label>
                <Textarea
                  value={currentProposal.notes || ''}
                  onChange={(e) => setEditedProposal({ ...editedProposal, notes: e.target.value })}
                  placeholder="Add notes..."
                  className="min-h-[80px]"
                />
              </div>
            </TabsContent>

            {/* Dates Tab */}
            <TabsContent value="dates" className="p-6 m-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lifecycle Dates</h3>
                <p className="text-sm text-muted-foreground">
                  Set or update dates for each stage of the proposal lifecycle.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <DatePickerField label="Draft Date" dateKey="draft_date" />
                  <DatePickerField label="Sent to Client" dateKey="sent_date" />
                  <DatePickerField label="Client Review" dateKey="review_date" />
                  <DatePickerField label="Negotiations" dateKey="negotiation_date" />
                  <DatePickerField label="Revision" dateKey="revision_date" />
                  <DatePickerField label="Approval" dateKey="approval_date" />
                  <DatePickerField label="Contract Signed" dateKey="signed_date" />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete Proposal
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={Object.keys(editedProposal).length === 0}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}