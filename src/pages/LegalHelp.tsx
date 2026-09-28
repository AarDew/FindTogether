import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Phone, Mail, ExternalLink } from 'lucide-react';

const LegalHelp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Legal Help & Resources
            </h1>
            <p className="text-lg text-muted-foreground">
              Access legal assistance and understand your rights when dealing with missing person cases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Legal Hotline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  24/7 legal assistance for urgent missing person cases and family rights.
                </p>
                <Button variant="hero" className="w-full">
                  Call Now: 1-800-LEGAL-HELP
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Legal Consultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Schedule a free consultation with legal experts specializing in missing person cases.
                </p>
                <Button variant="outline" className="w-full">
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Know Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Right to Information</h3>
                  <p className="text-muted-foreground text-sm">
                    You have the right to receive updates on your missing person case from law enforcement agencies.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy Protection</h3>
                  <p className="text-muted-foreground text-sm">
                    Your personal information and case details are protected under privacy laws.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Legal Representation</h3>
                  <p className="text-muted-foreground text-sm">
                    You have the right to legal representation throughout any legal proceedings.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Useful Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-foreground">National Missing Persons Database</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-foreground">Legal Aid Directory</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="text-foreground">Family Rights Information</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              The information provided here is for general guidance only and does not constitute legal advice. 
              For specific legal matters, please consult with a qualified attorney. In case of emergencies, 
              contact local law enforcement immediately.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalHelp;