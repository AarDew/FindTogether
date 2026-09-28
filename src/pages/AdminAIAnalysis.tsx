import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Brain, User, Clock, Target, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ReIdMatch {
  id: string;
  frame_number: number;
  timestamp_seconds: number;
  similarity: number;
  bbox: unknown;
  cropped_image_url: string | null;
  rank: number;
  admin_verified: boolean;
  admin_comment: string | null;
}

interface ReIdResult {
  id: string;
  case_id: string;
  reference_photo_url: string;
  video_url: string;
  total_frames_processed: number;
  total_persons_detected: number;
  processing_time_seconds: number;
  threshold: number;
  status: string;
  created_at: string;
  cases?: {
    name: string;
    photo_url: string | null;
  };
  reid_matches?: ReIdMatch[];
}

export default function AdminAIAnalysis() {
  const [results, setResults] = useState<ReIdResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ReIdResult | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('reid_results')
        .select(`
          *,
          cases (name, photo_url),
          reid_matches (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load AI analysis results');
    } finally {
      setLoading(false);
    }
  };

  const verifyMatch = async (matchId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('reid_matches')
        .update({ admin_verified: verified })
        .eq('id', matchId);

      if (error) throw error;
      toast.success(verified ? 'Match verified' : 'Match rejected');
      fetchResults();
    } catch (error: any) {
      toast.error('Failed to update match');
    }
  };

  const getConfidenceColor = (similarity: number) => {
    if (similarity >= 0.85) return 'text-green-500';
    if (similarity >= 0.70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (similarity: number) => {
    if (similarity >= 0.85) return <Badge className="bg-green-500/20 text-green-400">High Confidence</Badge>;
    if (similarity >= 0.70) return <Badge className="bg-yellow-500/20 text-yellow-400">Medium Confidence</Badge>;
    return <Badge className="bg-red-500/20 text-red-400">Low Confidence</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Analysis Results</h1>
            <p className="text-muted-foreground">Person Re-Identification using OSNet-IBN + YOLOv8</p>
          </div>
        </div>

        {results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No AI analysis results yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Results will appear here when footage is processed by the Python pipeline.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {result.cases?.name || 'Unknown Case'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Processed: {new Date(result.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                      {result.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{result.total_frames_processed}</p>
                      <p className="text-xs text-muted-foreground">Frames Processed</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{result.total_persons_detected}</p>
                      <p className="text-xs text-muted-foreground">Persons Detected</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{result.reid_matches?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Matches Found</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{Number(result.processing_time_seconds).toFixed(1)}s</p>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                    </div>
                  </div>

                  {/* Reference Photo + Top 3 Matches */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Reference Photo */}
                    <div className="lg:col-span-1">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" /> Reference Photo
                      </p>
                      <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden border-2 border-primary">
                        <img
                          src={result.reference_photo_url || result.cases?.photo_url || '/placeholder.svg'}
                          alt="Reference"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-center py-1 text-xs font-medium">
                          REFERENCE
                        </div>
                      </div>
                    </div>

                    {/* Top 3 Matches */}
                    <div className="lg:col-span-3">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Brain className="h-4 w-4" /> Top 3 Matches (OSNet-IBN Similarity)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(result.reid_matches || [])
                          .sort((a, b) => a.rank - b.rank)
                          .slice(0, 3)
                          .map((match, index) => (
                            <div key={match.id} className="relative">
                              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                                <img
                                  src={match.cropped_image_url || result.reference_photo_url || '/placeholder.svg'}
                                  alt={`Match ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {/* Rank Badge */}
                                <div className="absolute top-2 left-2 bg-background/90 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                  #{match.rank}
                                </div>
                                {/* Verification Status */}
                                {match.admin_verified !== null && (
                                  <div className={`absolute top-2 right-2 rounded-full p-1 ${match.admin_verified ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {match.admin_verified ? <CheckCircle className="h-4 w-4 text-white" /> : <XCircle className="h-4 w-4 text-white" />}
                                  </div>
                                )}
                              </div>
                              
                              {/* Match Info */}
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className={`text-lg font-bold ${getConfidenceColor(match.similarity)}`}>
                                    {(match.similarity * 100).toFixed(1)}%
                                  </span>
                                  {getConfidenceBadge(match.similarity)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Frame {match.frame_number} • {Number(match.timestamp_seconds).toFixed(1)}s
                                </div>
                                
                                {/* Admin Actions */}
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant={match.admin_verified ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => verifyMatch(match.id, true)}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={match.admin_verified === false ? 'destructive' : 'outline'}
                                    className="flex-1"
                                    onClick={() => verifyMatch(match.id, false)}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {/* Empty states for missing matches */}
                        {Array.from({ length: Math.max(0, 3 - (result.reid_matches?.length || 0)) }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-[3/4] bg-muted/30 rounded-lg border border-dashed flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No match</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View All Matches Button */}
                  {(result.reid_matches?.length || 0) > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setSelectedResult(result)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View All {result.reid_matches?.length} Matches
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
