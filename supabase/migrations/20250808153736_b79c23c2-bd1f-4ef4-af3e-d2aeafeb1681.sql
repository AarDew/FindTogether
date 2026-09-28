-- Create sightings table for tracking reported sightings
CREATE TABLE public.sightings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  missing_person_name TEXT,
  sighting_location TEXT NOT NULL,
  sighting_date DATE NOT NULL,
  sighting_time TIME,
  description TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_phone TEXT NOT NULL,
  reporter_email TEXT,
  confidence_level TEXT,
  additional_notes TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;

-- Create policies for sightings
CREATE POLICY "Anyone can submit sightings" 
ON public.sightings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view sightings" 
ON public.sightings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sightings" 
ON public.sightings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create storage bucket for sighting photos
INSERT INTO storage.buckets (id, name, public) VALUES ('sightings', 'sightings', true);

-- Create storage policies for sighting photos
CREATE POLICY "Anyone can upload sighting photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sightings');

CREATE POLICY "Sighting photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sightings');

-- Create trigger for automatic timestamp updates on sightings
CREATE TRIGGER update_sightings_updated_at
BEFORE UPDATE ON public.sightings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add sightings table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sightings;