import { Users, MapPin, Percent, Clock, Shield, Sparkles } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Users,
      title: 'Group Ordering',
      description: 'Create group orders with friends and split the delivery fee. More friends = more savings.',
    },
    {
      icon: MapPin,
      title: 'Campus-Only Delivery',
      description: 'Fast, reliable delivery anywhere on campus. Dorms, libraries, rec centers - we deliver everywhere.',
    },
    {
      icon: Percent,
      title: 'Student Discounts',
      description: 'Exclusive deals and discounts just for students. Save up to 20% on every order.',
    },
    {
      icon: Clock,
      title: 'Late Night Hours',
      description: 'Studying until 2am? We have got you covered with 24/7 delivery from select restaurants.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Student ID verification, secure payments, and contactless delivery for your safety.',
    },
    {
      icon: Sparkles,
      title: 'Rewards Program',
      description: 'Earn points with every order. Redeem for free meals, exclusive merch, and more.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Why Students Love DormPlate
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built by students, for students. Everything you need in a campus food delivery app.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg inline-block mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
