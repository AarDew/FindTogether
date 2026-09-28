import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const UploadFootage = () => {
  const [caseId, setCaseId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cid = searchParams.get('caseId');
    if (cid) {
      setCaseId(cid);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile || !caseId) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a case and a video file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload video to Supabase Storage
      const fileName = `${caseId}/${Date.now()}_${videoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('footage')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('footage')
        .getPublicUrl(fileName);

      setProgress(50);

      // Create footage upload record (without processing)
      const { error: insertError } = await supabase
        .from('footage_uploads')
        .insert({
          case_id: caseId,
          user_id: user.id,
          video_url: publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setProgress(100);

      toast({
        title: 'Upload Successful',
        description: 'Video uploaded successfully. An admin will process it soon.',
      });

      // Reset form
      setVideoFile(null);
      setCaseId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload video.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upload Footage
            </h1>
            <p className="text-lg text-muted-foreground">
              Help us find missing persons by uploading surveillance footage or videos
            </p>
          </div>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Video Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video">Video File *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload MP4, AVI, or MOV files (max 100MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Video File
                    </Button>
                    {videoFile && (
                      <p className="text-sm text-primary mt-2">
                        Selected: {videoFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Case Selection */}
                <div className="space-y-2">
                  <Label htmlFor="caseId">Related Case ID *</Label>
                  <Input
                    id="caseId"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    placeholder="Enter related case ID"
                  />
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Upload Footage
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your uploaded footage will be reviewed by an admin who will process it using AI face detection. You will be notified when the processing is complete and if any matches are found.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UploadFootage;