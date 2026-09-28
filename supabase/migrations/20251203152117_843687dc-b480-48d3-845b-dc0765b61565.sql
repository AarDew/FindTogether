-- Create table to store person re-identification results
CREATE TABLE public.reid_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  footage_id UUID REFERENCES public.footage_uploads(id) ON DELETE CASCADE,
  reference_photo_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  total_frames_processed INTEGER DEFAULT 0,
  total_persons_detected INTEGER DEFAULT 0,
  processing_time_seconds NUMERIC DEFAULT 0,
  threshold NUMERIC DEFAULT 0.70,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store individual matches from the Python pipeline
CREATE TABLE public.reid_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES public.reid_results(id) ON DELETE CASCADE,
  frame_number INTEGER NOT NULL,
  timestamp_seconds NUMERIC NOT NULL,
  similarity NUMERIC NOT NULL,
  bbox JSONB, -- [x1, y1, x2, y2]
  cropped_image_url TEXT,
  rank INTEGER, -- 1, 2, 3 for top matches
  admin_verified BOOLEAN DEFAULT false,
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reid_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reid_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for reid_results
CREATE POLICY "Authenticated users can view reid results"
ON public.reid_results FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert reid results"
ON public.reid_results FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reid results"
ON public.reid_results FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- RLS policies for reid_matches
CREATE POLICY "Authenticated users can view reid matches"
ON public.reid_matches FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert reid matches"
ON public.reid_matches FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reid matches"
ON public.reid_matches FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_reid_results_case_id ON public.reid_results(case_id);
CREATE INDEX idx_reid_results_status ON public.reid_results(status);
CREATE INDEX idx_reid_matches_result_id ON public.reid_matches(result_id);
CREATE INDEX idx_reid_matches_similarity ON public.reid_matches(similarity DESC);