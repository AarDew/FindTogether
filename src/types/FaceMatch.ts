export interface FaceEmbedding {
  id: string;
  case_id: string;
  embedding: number[];
  created_at: string;
}

export interface FaceMatch {
  id: string;
  case_id: string;
  frame_timestamp: number;
  confidence: number;
  thumbnail_url?: string;
  frame_url?: string;
  processed_at: string;
  status: 'pending' | 'verified' | 'rejected';
  processing_status?: 'processing' | 'completed' | 'failed';
  admin_comment?: string;
}

export interface ProcessingJob {
  id: string;
  case_id: string;
  video_url: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_frames: number;
  processed_frames: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  match_id?: string;
  type: 'match_found' | 'case_update' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Legacy interface for backward compatibility
export interface Match extends FaceMatch {}

export interface ProcessFootageRequest {
  video_url: string;
  case_id: string;
}

export interface ProcessFootageResponse {
  success: boolean;
  message: string;
  matches_found: number;
  job_id?: string;
}