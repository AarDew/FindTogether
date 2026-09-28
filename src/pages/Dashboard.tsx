import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Eye, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin,
  Star,
  Trophy,
  Camera
} from 'lucide-react';

const Dashboard = () => {
  type Case = { id: string; name: string; status: string; created_at: string };
  type FootageUpload = { id: string; case_id: string; status: string; uploaded_at: string };
  const [cases, setCases] = useState<Case[]>([]);
  const [footage, setFootage] = useState<FootageUpload[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [totalCases, setTotalCases] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCases([]); setLoadingCases(false); return; }
      const { data, error } = await supabase
        .from('cases')
        .select('id,name,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) { setCases([]); }
      else { setCases(data as Case[]); setTotalCases(data.length); }
      
      // Fetch footage uploads
      const { data: footageData } = await supabase
        .from('footage_uploads')
        .select('id, case_id, status, uploaded_at')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      
      if (footageData) setFootage(footageData as FootageUpload[]);
      
      setLoadingCases(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Real-time subscription for case updates
  useEffect(() => {
    const channel = supabase
      .channel('case-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases'
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Re-fetch cases to update the list
          const { data } = await supabase
            .from('cases')
            .select('id,name,status,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (data) {
            setCases(data as Case[]);
            setTotalCases(data.length);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time subscription for footage updates
  useEffect(() => {
    const channel = supabase
      .channel('footage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'footage_uploads'
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Re-fetch footage to update the list
          const { data } = await supabase
            .from('footage_uploads')
            .select('id, case_id, status, uploaded_at')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false });
          
          if (data) setFootage(data as FootageUpload[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Community Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time statistics and community impact metrics
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Cases"
            value={totalCases.toString()}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Successfully Found"
            value="—"
            icon={Heart}
            variant="success"
          />
          <StatsCard
            title="Community Tips"
            value="—"
            icon={Eye}
            variant="warning"
          />
          <StatsCard
            title="Success Rate"
            value="—"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCases ? (
                <div className="p-3 rounded-lg border border-border text-center text-muted-foreground">
                  Loading your cases...
                </div>
              ) : cases.length === 0 ? (
                <div className="p-3 rounded-lg border border-border text-center text-muted-foreground">
                  No cases yet. Submit your first case to see it here.
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {c.id}</div>
                        {/* Show footage status if exists */}
                        {footage.filter(f => f.case_id === c.id).map(f => (
                          <div key={f.id} className="mt-1">
                            <Badge 
                              variant={f.status === 'done' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              Footage: {f.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {c.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/upload-footage?caseId=${c.id}`}>Upload Footage</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg border border-border text-center text-muted-foreground">
                No contributors yet.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5" />
                Geographic Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active States</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Major Cities</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">International</span>
                  <span className="font-semibold">—</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="w-5 h-5" />
                Media Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Photos</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Videos</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AI Matches</span>
                  <Badge variant="secondary">—</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5" />
                Response Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Response</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fastest</span>
                  <span className="font-semibold text-success">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Emergency</span>
                  <span className="font-semibold text-destructive">—</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-hope text-secondary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Make a Difference Today</h2>
            <p className="text-lg mb-6 opacity-90">
              Every action counts. Join our community of helpers and bring families together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
                Report a Sighting
              </Button>
              <Button variant="hero">
                Upload Footage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;