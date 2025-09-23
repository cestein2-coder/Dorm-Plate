import React, { useState } from 'react';
import { Menu, X, Utensils } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">DormPlate</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#top-meals" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Top Meals
            </a>
            <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Reviews
            </a>
            <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              Get Started
            </button>
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
              <a href="#top-meals" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Top Meals
              </a>
              <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Reviews
              </a>
              <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Contact
              </a>
              <div className="pt-4 border-t">
                <button className="block w-full text-left text-gray-700 hover:text-orange-600 transition-colors font-medium mb-3">
                  Sign In
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium w-full">
                  Get Started
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;