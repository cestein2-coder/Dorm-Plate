import React from 'react';
import { Clock, MapPin, CreditCard, Users, Shield, Smartphone } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Lightning Fast Delivery",
      description: "Get your food delivered in 15 minutes or less. No more waiting around hungry between classes."
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Campus-Wide Coverage",
      description: "Deliver to your dorm, library, study spots, or anywhere on campus. We know every building and room."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Student Discounts",
      description: "Exclusive deals and discounts just for students. Save money while eating the food you love."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Group Ordering",
      description: "Split orders with friends easily. Perfect for study sessions, dorm parties, or late-night cravings."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safe & Secure",
      description: "All payments are encrypted and secure. Track your order in real-time for complete peace of mind."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Optimized",
      description: "Order on-the-go with our mobile-first design. Perfect for busy students always on their phones."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Campus Dining
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built DormPlate specifically for college life. Fast, convenient, and affordable food delivery 
            that works with your hectic schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-lg inline-block mb-4 group-hover:shadow-lg transition-shadow">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <div className="text-orange-100">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-orange-100">Partner Campuses</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15min</div>
              <div className="text-orange-100">Avg Delivery Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9⭐</div>
              <div className="text-orange-100">Student Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;