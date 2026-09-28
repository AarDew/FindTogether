-- Create sightings table for reporting missing person sightings
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
  status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
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

CREATE POLICY "Authenticated users can update sighting status" 
ON public.sightings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sightings_updated_at
BEFORE UPDATE ON public.sightings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for sighting photos
INSERT INTO storage.buckets (id, name, public) VALUES ('sightings', 'sightings', true);

-- Create policies for sighting photo uploads
CREATE POLICY "Anyone can upload sighting photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sightings');

CREATE POLICY "Sighting photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sightings');

-- Create admin profiles table
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  admin_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin profiles
CREATE POLICY "Admins can view their own profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert their profile" 
ON public.admin_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);