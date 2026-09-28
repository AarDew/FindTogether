import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">FindTogether</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Active Cases
            </Link>
            <Link to="/submit-case" className="text-foreground hover:text-primary transition-colors">
              Submit Case
            </Link>
            <Link to="/upload-footage" className="text-foreground hover:text-primary transition-colors">
              Upload Footage
            </Link>
            <Link to="/report-sighting" className="text-foreground hover:text-primary transition-colors">
              Report Sighting
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/matches" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin Matches
                </Link>
                <Link to="/admin/footage" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin Footage
                </Link>
              </>
            )}
            <Link to="/legal-help" className="text-foreground hover:text-primary transition-colors">
              Legal Help
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Active Cases
              </Link>
              <Link
                to="/submit-case"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Case
              </Link>
              <Link
                to="/upload-footage"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Upload Footage
              </Link>
              <Link
                to="/report-sighting"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Report Sighting
              </Link>
              <Link
                to="/dashboard"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin/matches"
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Matches
                  </Link>
                  <Link
                    to="/admin/footage"
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Footage
                  </Link>
                </>
              )}
              <Link
                to="/legal-help"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Legal Help
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Logout</Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button variant="hero" asChild>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navigation;