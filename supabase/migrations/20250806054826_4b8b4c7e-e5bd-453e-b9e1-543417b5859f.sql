-- Add status and admin_comment columns to matches table
ALTER TABLE public.matches 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
ADD COLUMN admin_comment TEXT;

-- Create index for better performance on status filtering
CREATE INDEX idx_matches_status ON public.matches(status);

-- Add RLS policies for admin access to matches
CREATE POLICY "Authenticated users can update match status" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Update the existing select policy to be more explicit
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by authenticated users" 
ON public.matches 
FOR SELECT 
USING (auth.uid() IS NOT NULL);