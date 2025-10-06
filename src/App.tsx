import React from 'react';
import { AuthProvider } from './components/auth/AuthProvider';
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


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header />
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