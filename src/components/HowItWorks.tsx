import { Search, Users, Truck, Pizza } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Browse Menus',
      description: 'Explore restaurants across your campus, from dining halls to food trucks',
    },
    {
      icon: Users,
      title: 'Order Together',
      description: 'Split delivery fees by ordering with roommates and friends',
    },
    {
      icon: Truck,
      title: 'Track Delivery',
      description: 'Watch your food arrive in real-time from kitchen to dorm room',
    },
    {
      icon: Pizza,
      title: 'Enjoy & Save',
      description: 'Get exclusive student discounts and rewards with every order',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four simple steps to get food delivered to your dorm
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg inline-block">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-red-500">Step {index + 1}</div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
