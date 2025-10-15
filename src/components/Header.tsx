import React, { useState } from 'react';
import { Menu, X, Utensils, User, LogOut } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import AuthModal from './auth/AuthModal';

interface HeaderProps {
  onNavigateToApp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToApp }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, profile, signOut } = useAuth();

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthMode('signin');
    setAuthModalOpen(true);
  };
  return (
    <>
  <header className="bg-food-cream/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-food-orange to-food-green p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-food-brown">DormPlate</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/sustainable-meals" className="text-food-brown hover:text-food-orange transition-colors font-medium" onClick={e => { e.preventDefault(); window.location.assign('/sustainable-meals'); }}>
              Popular Meals
            </a>
            <a href="#features" className="text-food-brown hover:text-food-orange transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-food-brown hover:text-food-orange transition-colors font-medium">
              Pricing
            </a>
            <a href="#testimonials" className="text-food-brown hover:text-food-orange transition-colors font-medium">
              Reviews
            </a>
            <a href="#contact" className="text-food-brown hover:text-food-orange transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-food-brown" />
                <span className="text-food-brown font-medium">
                  {profile?.first_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-food-brown hover:text-food-orange transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="text-food-brown hover:text-food-orange transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="bg-gradient-to-r from-food-orange to-food-green text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a href="#top-meals" className="text-food-brown hover:text-food-orange transition-colors font-medium">
                Popular Meals
              </a>
              <a href="#features" className="text-food-brown hover:text-food-orange transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-food-brown hover:text-food-orange transition-colors font-medium">
                Pricing
              </a>
              <a href="#testimonials" className="text-food-brown hover:text-food-orange transition-colors font-medium">
                Reviews
              </a>
              <a href="#contact" className="text-food-brown hover:text-food-orange transition-colors font-medium">
                Contact
              </a>
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-food-brown">
                      <User className="h-5 w-5" />
                      <span className="font-medium">
                        {profile?.first_name || user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full text-left text-food-brown hover:text-food-orange transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAuthClick('signin')}
                      className="block w-full text-left text-food-brown hover:text-food-orange transition-colors font-medium mb-3"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="bg-gradient-to-r from-food-orange to-food-green text-white px-6 py-2 rounded-lg font-medium w-full"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;