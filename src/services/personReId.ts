/**
 * PERSON RE-IDENTIFICATION SERVICE
 * 
 * This service handles communication with the external Python pipeline.
 * 
 * Pipeline Architecture:
 * - OSNet-IBN (512-dim feature vectors) for person re-identification
 * - YOLOv8 for person detection
 * - Cosine similarity for matching
 * 
 * Workflow:
 * 1. User uploads video → stored in Supabase Storage
 * 2. External Python script (running on GPU server) processes video
 * 3. Python script POSTs results to /functions/v1/receiveReIdResults
 * 4. Admin views results in /admin/ai-analysis
 */

export interface PersonMatch {
  frame_number: number;
  timestamp_seconds: number;
  similarity: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  cropped_image_url?: string;
}

export interface ReIdPayload {
  case_id: string;
  footage_id?: string;
  reference_photo_url: string;
  video_url: string;
  total_frames_processed: number;
  total_persons_detected: number;
  processing_time_seconds: number;
  threshold: number;
  matches: PersonMatch[];
}

export interface ProcessingStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

/**
 * Python script template for posting results to Supabase Edge Function
 * 
 * Usage in Google Colab/Python environment:
 * ```python
 * import requests
 * 
 * SUPABASE_URL = "https://wsphhlzlnhqmtvkdrnjy.supabase.co"
 * 
 * def post_reid_results(case_id, reference_photo_url, video_url, matches):
 *     payload = {
 *         "case_id": case_id,
 *         "reference_photo_url": reference_photo_url,
 *         "video_url": video_url,
 *         "total_frames_processed": len(frames),
 *         "total_persons_detected": total_persons,
 *         "processing_time_seconds": processing_time,
 *         "threshold": threshold,
 *         "matches": [
 *             {
 *                 "frame_number": m['frame_num'],
 *                 "timestamp_seconds": m['time'],
 *                 "similarity": float(m['similarity']),
 *                 "bbox": m['bbox'],
 *                 "cropped_image_url": upload_cropped_image(m['image'])
 *             }
 *             for m in matches
 *         ]
 *     }
 *     
 *     response = requests.post(
 *         f"{SUPABASE_URL}/functions/v1/receiveReIdResults",
 *         json=payload,
 *         headers={"Content-Type": "application/json"}
 *     )
 *     return response.json()
 * ```
 */

// Mock function to simulate results (for testing without Python backend)
export async function mockProcessVideoForReId(
  referencePhotoUrl: string,
  videoUrl: string,
  caseId: string,
  threshold: number = 0.70
): Promise<ReIdPayload> {
  console.log('Mock processing video for person re-identification...');
  console.log('Reference photo:', referencePhotoUrl);
  console.log('Video URL:', videoUrl);
  console.log('Case ID:', caseId);
  console.log('Threshold:', threshold);

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock results matching Python pipeline output format
  return {
    case_id: caseId,
    reference_photo_url: referencePhotoUrl,
    video_url: videoUrl,
    total_frames_processed: 150,
    total_persons_detected: 45,
    processing_time_seconds: 12.5,
    threshold,
    matches: [
      {
        frame_number: 120,
        timestamp_seconds: 4.0,
        similarity: 0.89,
        bbox: [100, 50, 200, 300],
        cropped_image_url: referencePhotoUrl
      },
      {
        frame_number: 450,
        timestamp_seconds: 15.0,
        similarity: 0.82,
        bbox: [150, 60, 250, 320],
        cropped_image_url: referencePhotoUrl
      },
      {
        frame_number: 780,
        timestamp_seconds: 26.0,
        similarity: 0.76,
        bbox: [80, 40, 180, 280],
        cropped_image_url: referencePhotoUrl
      }
    ]
  };
}

// Cosine similarity (matching Python implementation)
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

/**
 * Edge Function URL for receiving results
 */
export const REID_ENDPOINT = 'https://wsphhlzlnhqmtvkdrnjy.supabase.co/functions/v1/receiveReIdResults';
