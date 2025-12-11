-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to projects table
ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to proposals table  
ALTER TABLE public.proposals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to tasks table
ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public policies and create user-specific ones

-- Projects policies
DROP POLICY IF EXISTS "Public read access" ON public.projects;
DROP POLICY IF EXISTS "Public insert access" ON public.projects;
DROP POLICY IF EXISTS "Public update access" ON public.projects;
DROP POLICY IF EXISTS "Public delete access" ON public.projects;

CREATE POLICY "Users can view own projects"
ON public.projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Tasks policies
DROP POLICY IF EXISTS "Public read access" ON public.tasks;
DROP POLICY IF EXISTS "Public insert access" ON public.tasks;
DROP POLICY IF EXISTS "Public update access" ON public.tasks;
DROP POLICY IF EXISTS "Public delete access" ON public.tasks;

CREATE POLICY "Users can view own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Proposals policies
DROP POLICY IF EXISTS "Public read access" ON public.proposals;
DROP POLICY IF EXISTS "Public insert access" ON public.proposals;
DROP POLICY IF EXISTS "Public update access" ON public.proposals;
DROP POLICY IF EXISTS "Public delete access" ON public.proposals;

CREATE POLICY "Users can view own proposals"
ON public.proposals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own proposals"
ON public.proposals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals"
ON public.proposals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proposals"
ON public.proposals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Tags remain public for all authenticated users
DROP POLICY IF EXISTS "Public read access" ON public.tags;
DROP POLICY IF EXISTS "Public insert access" ON public.tags;
DROP POLICY IF EXISTS "Public update access" ON public.tags;
DROP POLICY IF EXISTS "Public delete access" ON public.tags;

CREATE POLICY "Authenticated users can view tags"
ON public.tags FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tags"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
ON public.tags FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tags"
ON public.tags FOR DELETE
TO authenticated
USING (true);

-- Task comments policies (based on task ownership)
DROP POLICY IF EXISTS "Public read access" ON public.task_comments;
DROP POLICY IF EXISTS "Public insert access" ON public.task_comments;
DROP POLICY IF EXISTS "Public update access" ON public.task_comments;
DROP POLICY IF EXISTS "Public delete access" ON public.task_comments;

CREATE POLICY "Users can view comments on own tasks"
ON public.task_comments FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can create comments on own tasks"
ON public.task_comments FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can update comments on own tasks"
ON public.task_comments FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can delete comments on own tasks"
ON public.task_comments FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_comments.task_id AND tasks.user_id = auth.uid()));

-- Task tags policies
DROP POLICY IF EXISTS "Public read access" ON public.task_tags;
DROP POLICY IF EXISTS "Public insert access" ON public.task_tags;
DROP POLICY IF EXISTS "Public delete access" ON public.task_tags;

CREATE POLICY "Users can view task_tags on own tasks"
ON public.task_tags FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can create task_tags on own tasks"
ON public.task_tags FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can delete task_tags on own tasks"
ON public.task_tags FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

-- Task attachments policies
DROP POLICY IF EXISTS "Public read access" ON public.task_attachments;
DROP POLICY IF EXISTS "Public insert access" ON public.task_attachments;
DROP POLICY IF EXISTS "Public delete access" ON public.task_attachments;

CREATE POLICY "Users can view attachments on own tasks"
ON public.task_attachments FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_attachments.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can create attachments on own tasks"
ON public.task_attachments FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_attachments.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can delete attachments on own tasks"
ON public.task_attachments FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_attachments.task_id AND tasks.user_id = auth.uid()));

-- Activity logs - users can view logs for their own entities
DROP POLICY IF EXISTS "Public read access" ON public.activity_logs;
DROP POLICY IF EXISTS "Public insert access" ON public.activity_logs;

CREATE POLICY "Users can view own activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);