import React, { useState } from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { waitlistHelpers } from '../lib/mvp-supabase';

const CTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email
      if (!email.includes('@') || !email.includes('.edu')) {
        throw new Error('Please use your .edu email address');
      }

      const { error: waitlistError } = await waitlistHelpers.addToWaitlist(
        email, 
        university || undefined,
        'landing_page'
      );

      if (waitlistError) {
        if (waitlistError.message?.includes('duplicate')) {
          throw new Error('You\'re already on our waitlist! We\'ll be in touch soon.');
        }
        throw waitlistError;
      }

      setSubmitted(true);
      setEmail('');
      setUniversity('');
      
      // Reset after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Be First to Experience Campus Food Delivery
        </h2>
        
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          DormPlate is launching soon! Join our waitlist to get early access and exclusive 
          student discounts when we go live.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>Early access</span>
          </div>
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>Exclusive student deals</span>
          </div>
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>Free delivery credits</span>
          </div>
        </div>

        {/* Waitlist Signup */}
        <div className="max-w-lg mx-auto mb-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your .edu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="University (optional)"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining Waitlist...' : 'Join Waitlist'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>
          ) : (
            <div className="bg-white/20 text-white px-6 py-4 rounded-lg text-center">
              <Check className="h-8 w-8 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">You're on the list!</h3>
              <p className="text-orange-100">We'll email you when DormPlate launches on your campus.</p>
            </div>
          )}
        </div>

        <p className="text-orange-100 text-sm">
          🎓 Launching at UC Berkeley, UCLA, USC, and Stanford first
        </p>
      </div>
    </section>
  );
};

export default CTA;