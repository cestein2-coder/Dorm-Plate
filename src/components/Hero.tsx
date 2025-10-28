import React, { useState } from 'react';
import { ArrowRight, Clock, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import WaitlistModal from './WaitlistModal';

const Hero: React.FC = () => {
  const { user } = useAuth();
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
    <section className="pt-20 pb-16 bg-gradient-to-br from-orange-50 via-white to-green-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <MapPin className="h-4 w-4 mr-2" />
              Now available on 50+ campuses
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Food Delivery for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-food-orange to-food-green"> College Students</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Skip the dining hall lines. Order from your favorite campus restaurants and local spots. 
              Get it delivered fast to your dorm, library, or anywhere on campus.
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-food-orange" />
                <span className="text-gray-700 font-medium">15 min avg delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-gray-700 font-medium">Student discounts</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <button className="bg-gradient-to-r from-food-orange to-food-orange-dark text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center group">
                  Order Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' })}
                  className="bg-gradient-to-r from-food-orange to-food-orange-dark text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              
              <button
                onClick={() => setWaitlistOpen(true)}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-food-orange hover:text-food-orange transition-colors">
                Join Waitlist
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 text-sm text-gray-500">
              {user ? 'Welcome back! Ready to order?' : 'Join 25,000+ students already using DormPlate'}
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    On the way
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chicken Bowl</span>
                    <span className="font-medium">$12.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Side of Fries</span>
                    <span className="font-medium">$4.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drink</span>
                    <span className="font-medium">$2.99</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$20.97</span>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-500 mb-2">Estimated delivery</div>
                  <div className="text-2xl font-bold text-food-brown">12 mins</div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
                <span className="text-2xl">🍕</span>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-food-orange rounded-full p-3 shadow-lg animate-bounce delay-1000">
                <span className="text-2xl">🍔</span>
              </div>
              
              <div className="absolute top-1/2 -right-8 bg-green-400 rounded-full p-3 shadow-lg animate-bounce delay-500">
                <span className="text-2xl">🌮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <WaitlistModal
      isOpen={waitlistOpen}
      onClose={() => setWaitlistOpen(false)}
    />
    </>
  );
};

export default Hero;