-- Add thumbnail_url to matches table for storing matched face thumbnails
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add frame_url to matches table for storing the full frame
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS frame_url TEXT;

-- Add processing_status to track pipeline stages
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'processing' CHECK (processing_status IN ('processing', 'completed', 'failed'));

-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'match_found' CHECK (type IN ('match_found', 'case_update', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create processing_jobs table to track video processing
CREATE TABLE IF NOT EXISTS public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_frames INTEGER DEFAULT 0,
  processed_frames INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on processing_jobs
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for processing_jobs
CREATE POLICY "Authenticated users can view processing jobs" 
ON public.processing_jobs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage processing jobs" 
ON public.processing_jobs 
FOR ALL 
USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_case_id ON public.matches(case_id);
CREATE INDEX IF NOT EXISTS idx_matches_confidence ON public.matches(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_matches_processed_at ON public.matches(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON public.processing_jobs(status);

-- Enable realtime for tables
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.processing_jobs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;  
ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;