-- Create footage_uploads table to track uploaded videos
CREATE TABLE public.footage_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  video_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  error_message text
);

-- Enable RLS
ALTER TABLE public.footage_uploads ENABLE ROW LEVEL SECURITY;

-- Users can insert their own footage
CREATE POLICY "Users can upload footage for their cases"
ON public.footage_uploads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own footage
CREATE POLICY "Users can view their own footage"
ON public.footage_uploads
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all footage
CREATE POLICY "Admins can view all footage"
ON public.footage_uploads
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can update footage status
CREATE POLICY "Admins can update footage status"
ON public.footage_uploads
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Enable realtime
ALTER TABLE public.footage_uploads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.footage_uploads;

-- Update cases table to enable realtime
ALTER TABLE public.cases REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;