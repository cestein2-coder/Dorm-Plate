import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const CTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
          Ready to Transform Your Campus Dining?
        </h2>
        
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          Join thousands of students who've already upgraded their food game. 
          Get started today with our 14-day free trial.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>Free 14-day trial</span>
          </div>
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center text-white">
            <Check className="h-5 w-5 mr-2" />
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Email Signup */}
        <div className="max-w-md mx-auto mb-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your .edu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </form>
          ) : (
            <div className="bg-white/20 text-white px-6 py-3 rounded-lg flex items-center justify-center">
              <Check className="h-5 w-5 mr-2" />
              <span>Thanks! We'll be in touch soon.</span>
            </div>
          )}
        </div>

        <p className="text-orange-100 text-sm">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default CTA;