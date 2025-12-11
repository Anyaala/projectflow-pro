-- Create enums for the tracker system
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.task_status AS ENUM ('not_started', 'in_progress', 'on_hold', 'review', 'completed');
CREATE TYPE public.proposal_stage AS ENUM ('draft', 'sent_to_client', 'client_review', 'negotiation', 'revision', 'approved', 'contract_signed');

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#06b6d4',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#06b6d4',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'not_started',
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  depends_on UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  estimated_hours NUMERIC(10,2),
  actual_hours NUMERIC(10,2),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_tags junction table
CREATE TABLE public.task_tags (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_attachments table
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  value NUMERIC(15,2),
  stage proposal_stage DEFAULT 'draft',
  probability_to_close INTEGER DEFAULT 50 CHECK (probability_to_close >= 0 AND probability_to_close <= 100),
  draft_date DATE,
  sent_date DATE,
  review_date DATE,
  negotiation_date DATE,
  revision_date DATE,
  approval_date DATE,
  signed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  actor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default tags
INSERT INTO public.tags (name, color) VALUES
  ('Research', '#8b5cf6'),
  ('Proposal', '#f59e0b'),
  ('Testing', '#10b981'),
  ('Design', '#ec4899'),
  ('Review', '#3b82f6'),
  ('Development', '#06b6d4'),
  ('Documentation', '#6366f1'),
  ('Urgent', '#ef4444');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (entity_type, entity_id, action, details, actor)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END,
    'system'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create activity log triggers
CREATE TRIGGER log_tasks_activity AFTER INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_activity();
CREATE TRIGGER log_proposals_activity AFTER INSERT OR UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for demo purposes - can be restricted later with auth)
CREATE POLICY "Public read access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.tags FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.task_tags FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.task_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.task_tags FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.task_comments FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.task_comments FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.task_attachments FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.task_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.task_attachments FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.proposals FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.proposals FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;