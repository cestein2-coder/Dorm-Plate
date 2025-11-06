import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Header from './components/Header';
import Hero from './components/Hero';
import RestaurantCarousel from './components/RestaurantCarousel';
import StatsCounter from './components/StatsCounter';
import LiveOrderTracking from './components/LiveOrderTracking';
import DeliveryMap from './components/DeliveryMap';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQAccordion from './components/FAQAccordion';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <RestaurantCarousel />
      <StatsCounter />
      <LiveOrderTracking />
      <DeliveryMap />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQAccordion />
      <CTA />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;