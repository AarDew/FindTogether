import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">FindTogether</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Bringing missing persons home through community collaboration and advanced technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Active Cases
              </Link>
              <Link to="/submit-case" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Submit Case
              </Link>
              <Link to="/report-sighting" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Report Sighting
              </Link>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <div className="space-y-2">
              <Link to="/legal-help" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Legal Help
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Emergency</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">911</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:help@findtogether.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  help@findtogether.org
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-sm text-muted-foreground">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 FindTogether. All rights reserved. Together we bring them home.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;