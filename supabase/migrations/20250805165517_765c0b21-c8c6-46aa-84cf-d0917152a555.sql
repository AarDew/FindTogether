-- Create face_embeddings table
CREATE TABLE public.face_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  embedding JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  frame_timestamp NUMERIC NOT NULL,
  confidence FLOAT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for face_embeddings
CREATE POLICY "Face embeddings are viewable by everyone" 
ON public.face_embeddings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert face embeddings" 
ON public.face_embeddings 
FOR INSERT 
WITH CHECK (true);

-- Create policies for matches
CREATE POLICY "Matches are viewable by everyone" 
ON public.matches 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_face_embeddings_case_id ON public.face_embeddings(case_id);
CREATE INDEX idx_matches_case_id ON public.matches(case_id);
CREATE INDEX idx_matches_confidence ON public.matches(confidence);

-- Create storage bucket for footage
INSERT INTO storage.buckets (id, name, public) VALUES ('footage', 'footage', false);

-- Create policies for footage storage
CREATE POLICY "Footage is viewable by authenticated users" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'footage' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload footage" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'footage' AND auth.role() = 'authenticated');

-- Enable realtime for matches table
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;