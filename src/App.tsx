import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

type AppView = 'landing' | 'app';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Show app if user is logged in and wants to use the app
  if (user && currentView === 'app') {
    return <Dashboard />;
  }

  // Show landing page by default
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateToApp={() => setCurrentView('app')} />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
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