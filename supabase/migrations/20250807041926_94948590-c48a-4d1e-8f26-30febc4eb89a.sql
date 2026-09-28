-- Fix realtime publication by only adding new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;  
ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;