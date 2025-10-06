import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Header from './components/Header';
import Hero from './components/Hero';
import RestaurantCarousel from './components/RestaurantCarousel';
import StatsCounter from './components/StatsCounter';
import LiveOrderTracking from './components/LiveOrderTracking';
import DeliveryMap from './components/DeliveryMap';
import PinDeliveryLocation from './components/PinDeliveryLocation';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQAccordion from './components/FAQAccordion';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import AuthModal from './components/auth/AuthModal';


function App() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />
        {!user && (
          <div className="flex justify-center my-4">
            <button
              className="bg-food-brown text-white py-2 px-6 rounded hover:bg-food-yellow hover:text-food-brown transition text-lg font-bold shadow"
              onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
            >
              Sign In / Sign Up
            </button>
          </div>
        )}
        {showAuth && (
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode={authMode} />
        )}
        <Hero />
        <RestaurantCarousel />
        <StatsCounter />
        <LiveOrderTracking />
        <DeliveryMap />
        <PinDeliveryLocation />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQAccordion />
        <CTA />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;