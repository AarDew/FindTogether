import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { CheckCircle, XCircle, Eye, Filter, ShieldAlert, User } from 'lucide-react';

interface MatchWithCase {
  id: string;
  case_id: string;
  frame_timestamp: number;
  confidence: number;
  processed_at: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_comment?: string;
  thumbnail_url?: string;
  frame_url?: string;
  cases?: {
    name: string;
    photo_url: string | null;
  };
}

const AdminMatches = () => {
  const [matches, setMatches] = useState<MatchWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [confidenceFilter, setConfidenceFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewingMatch, setReviewingMatch] = useState<MatchWithCase | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchMatches();
    }
  }, [isAdmin]);

  const fetchMatches = async () => {
    try {
      // First fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('processed_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Get unique case_ids
      const caseIds = [...new Set((matchesData || []).map(m => m.case_id))];
      
      // Fetch cases for those IDs
      let casesMap: Record<string, { name: string; photo_url: string | null }> = {};
      if (caseIds.length > 0) {
        const { data: casesData } = await supabase
          .from('cases')
          .select('id, name, photo_url')
          .in('id', caseIds);
        
        casesMap = (casesData || []).reduce((acc, c) => {
          acc[c.id] = { name: c.name, photo_url: c.photo_url };
          return acc;
        }, {} as Record<string, { name: string; photo_url: string | null }>);
      }

      // Combine data
      setMatches((matchesData || []).map(match => ({
        ...match,
        status: match.status as 'pending' | 'verified' | 'rejected',
        cases: casesMap[match.case_id]
      })));
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: 'verified' | 'rejected', comment: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status, 
          admin_comment: comment 
        })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, status, admin_comment: comment }
          : match
      ));

      toast({
        title: 'Success',
        description: `Match ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update match status',
        variant: 'destructive',
      });
    }
  };

  const filteredMatches = matches.filter(match => {
    const passesConfidence = !confidenceFilter || match.confidence >= parseFloat(confidenceFilter);
    const passesStatus = statusFilter === 'all' || match.status === statusFilter;
    return passesConfidence && passesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusStats = () => {
    return {
      pending: matches.filter(m => m.status === 'pending').length,
      verified: matches.filter(m => m.status === 'verified').length,
      rejected: matches.filter(m => m.status === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Match Review
          </h1>
          <p className="text-muted-foreground">
            Review and verify AI-detected face matches from uploaded footage
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Matches</p>
                  <p className="text-2xl font-bold text-green-500">{stats.verified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">False Matches</p>
                  <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confidence">Minimum Confidence</Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="0.7"
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No matches found with current filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Reference Photo Thumbnail */}
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {match.cases?.photo_url ? (
                          <img 
                            src={match.cases.photo_url} 
                            alt="Reference" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{match.cases?.name || 'Unknown Case'}</h3>
                          {getStatusBadge(match.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Confidence:</span> {Math.round(match.confidence * 100)}%
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {match.frame_timestamp}s
                          </div>
                          <div>
                            <span className="font-medium">Processed:</span> {new Date(match.processed_at).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Match ID:</span> {match.id.slice(0, 8)}...
                          </div>
                        </div>
                        {match.admin_comment && (
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="text-sm"><span className="font-medium">Admin Comment:</span> {match.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {match.status === 'pending' && (
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setReviewingMatch(match);
                                setReviewComment('');
                              }}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Match</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Side-by-side Image Comparison */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Reference Photo */}
                                <div>
                                  <p className="text-sm font-medium mb-2 text-center">Reference Photo</p>
                                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border-2 border-primary">
                                    {match.cases?.photo_url ? (
                                      <img 
                                        src={match.cases.photo_url} 
                                        alt="Reference" 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-center mt-1 text-muted-foreground">
                                    {match.cases?.name || 'Unknown'}
                                  </p>
                                </div>
                                
                                {/* Detected Match */}
                                <div>
                                  <p className="text-sm font-medium mb-2 text-center">Detected Match</p>
                                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border-2 border-green-500">
                                    {match.thumbnail_url || match.frame_url ? (
                                      <img 
                                        src={match.thumbnail_url || match.frame_url} 
                                        alt="Detected" 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                                        <User className="w-12 h-12 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">No image available</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-center mt-1 text-muted-foreground">
                                    Frame {match.frame_timestamp}s
                                  </p>
                                </div>
                              </div>
                              
                              {/* Match Details */}
                              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Confidence</span>
                                  <span className={`font-bold ${match.confidence >= 0.85 ? 'text-green-500' : match.confidence >= 0.7 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {Math.round(match.confidence * 100)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Frame Timestamp</span>
                                  <span className="font-medium">{match.frame_timestamp}s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Case ID</span>
                                  <span className="font-mono text-xs">{match.case_id}</span>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="comment">Admin Comment</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="Add any notes about this match..."
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    updateMatchStatus(match.id, 'rejected', reviewComment);
                                    setReviewingMatch(null);
                                  }}
                                >
                                  Mark as False Match
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    updateMatchStatus(match.id, 'verified', reviewComment);
                                    setReviewingMatch(null);
                                  }}
                                >
                                  Verify Match
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminMatches;