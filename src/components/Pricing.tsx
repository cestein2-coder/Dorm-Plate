import React from 'react';
import { Check, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for occasional orders",
      features: [
        "Standard delivery",
        "Basic customer support",
        "Order tracking",
        "Student discounts"
      ],
      buttonText: "Get Started",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-food-orange hover:text-food-orange"
    },
    {
      name: "DormPlate Plus",
      price: "$4.99",
      period: "/month",
      description: "Best value for regular students",
      features: [
        "Free delivery on orders $15+",
        "Priority customer support",
        "Advanced order tracking",
        "Exclusive student deals",
        "Group ordering tools",
        "Order scheduling"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-gradient-to-r from-food-orange to-food-orange-dark text-white hover:shadow-xl transform hover:-translate-y-1",
      popular: true
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      description: "For the ultimate dining experience",
      features: [
        "Free delivery on all orders",
        "24/7 premium support",
        "Real-time GPS tracking",
        "VIP student perks",
        "Unlimited group orders",
        "Smart meal planning",
        "Early access to new restaurants"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:border-food-orange hover:text-food-orange"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade when you're ready. All plans include student discounts 
            and campus-wide delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-food-orange shadow-lg relative' 
                  : 'border-gray-200 hover:border-food-cream'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-food-orange to-food-orange-dark text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans come with a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;