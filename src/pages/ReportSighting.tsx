import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, AlertTriangle, Upload, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ReportSighting = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    missing_person_name: '',
    sighting_location: '',
    sighting_date: '',
    sighting_time: '',
    description: '',
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
    confidence_level: '',
    additional_notes: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('sightings')
          .upload(fileName, photo);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('sightings')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // Insert sighting data - use any type to bypass TypeScript issues with new table
      const { error } = await (supabase as any)
        .from('sightings')
        .insert({
          missing_person_name: formData.missing_person_name,
          sighting_location: formData.sighting_location,
          sighting_date: formData.sighting_date,
          sighting_time: formData.sighting_time,
          description: formData.description,
          reporter_name: formData.reporter_name,
          reporter_phone: formData.reporter_phone,
          reporter_email: formData.reporter_email,
          confidence_level: formData.confidence_level,
          additional_notes: formData.additional_notes,
          photo_url: photoUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sighting reported successfully!",
        description: "Thank you for your report. Authorities will review this information.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit sighting report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <CardTitle className="text-2xl">Report a Sighting</CardTitle>
              <p className="text-muted-foreground">
                Help reunite families by reporting any sightings of missing persons
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Missing Person Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Sighting Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="missing_person_name">Missing Person's Name (if known)</Label>
                    <Input
                      id="missing_person_name"
                      value={formData.missing_person_name}
                      onChange={(e) => handleInputChange('missing_person_name', e.target.value)}
                      placeholder="Enter the missing person's name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sighting_location">Sighting Location *</Label>
                    <Input
                      id="sighting_location"
                      required
                      value={formData.sighting_location}
                      onChange={(e) => handleInputChange('sighting_location', e.target.value)}
                      placeholder="Exact address or landmark where you saw them"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sighting_date">Date of Sighting *</Label>
                      <Input
                        id="sighting_date"
                        type="date"
                        required
                        value={formData.sighting_date}
                        onChange={(e) => handleInputChange('sighting_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sighting_time">Time of Sighting</Label>
                      <Input
                        id="sighting_time"
                        type="time"
                        value={formData.sighting_time}
                        onChange={(e) => handleInputChange('sighting_time', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confidence_level">How certain are you?</Label>
                    <Select value={formData.confidence_level} onValueChange={(value) => handleInputChange('confidence_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select confidence level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_sure">Very sure - I'm confident it was them</SelectItem>
                        <SelectItem value="somewhat_sure">Somewhat sure - Strong resemblance</SelectItem>
                        <SelectItem value="possible">Possible - Could be them</SelectItem>
                        <SelectItem value="unsure">Unsure - Just a possibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description of Sighting *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what you saw, what they were wearing, who they were with, their condition, etc."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_notes">Additional Notes</Label>
                    <Textarea
                      id="additional_notes"
                      value={formData.additional_notes}
                      onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                      placeholder="Any other relevant information"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Photo (Optional)
                  </h3>
                  
                  <div>
                    <Label htmlFor="photo">Upload a photo if available</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Any photo from the sighting location or of the person (if it's safe and legal to take)
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Your Contact Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="reporter_name">Your Name *</Label>
                    <Input
                      id="reporter_name"
                      required
                      value={formData.reporter_name}
                      onChange={(e) => handleInputChange('reporter_name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reporter_phone">Your Phone Number *</Label>
                    <Input
                      id="reporter_phone"
                      type="tel"
                      required
                      value={formData.reporter_phone}
                      onChange={(e) => handleInputChange('reporter_phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reporter_email">Your Email</Label>
                    <Input
                      id="reporter_email"
                      type="email"
                      value={formData.reporter_email}
                      onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Important:</strong> Your report will be reviewed by authorities and families. 
                    Please ensure all information is accurate. If this is an emergency or you see someone 
                    in immediate danger, call 911 immediately.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting Report..." : "Submit Sighting Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportSighting;