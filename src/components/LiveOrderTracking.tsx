import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChefHat, Bike, MapPin } from 'lucide-react';

interface OrderStage {
  id: number;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const orderStages: OrderStage[] = [
  {
    id: 1,
    label: 'Order Placed',
    icon: <CheckCircle className="h-6 w-6" />,
    description: 'Your order has been confirmed'
  },
  {
    id: 2,
    label: 'Preparing',
    icon: <ChefHat className="h-6 w-6" />,
    description: 'Restaurant is preparing your food'
  },
  {
    id: 3,
    label: 'Out for Delivery',
    icon: <Bike className="h-6 w-6" />,
    description: 'Your order is on the way'
  },
  {
    id: 4,
    label: 'Delivered',
    icon: <MapPin className="h-6 w-6" />,
    description: 'Enjoy your meal!'
  }
];

const LiveOrderTracking: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate through stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < orderStages.length - 1) {
          return prev + 1;
        }
        return 0; // Loop back to start
      });
    }, 3000);

    return () => clearInterval(stageInterval);
  }, []);

  useEffect(() => {
    // Smooth progress bar animation
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 2;
        }
        return 100;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStage]);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real-Time Order Tracking
          </h2>
          <p className="text-xl text-gray-600">
            Know exactly where your food is, every step of the way
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          {/* Current Stage Highlight */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full mb-4 animate-pulse">
              {orderStages[currentStage].icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {orderStages[currentStage].label}
            </h3>
            <p className="text-gray-600">{orderStages[currentStage].description}</p>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${(currentStage / (orderStages.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* All Stages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {orderStages.map((stage, index) => (
              <div
                key={stage.id}
                className={`text-center p-4 rounded-lg transition-all duration-500 ${
                  index <= currentStage
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-colors duration-500 ${
                    index <= currentStage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stage.icon}
                </div>
                <div
                  className={`text-sm font-semibold transition-colors duration-500 ${
                    index <= currentStage ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            ))}
          </div>

          {/* Estimated Time */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-50 px-6 py-3 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-semibold">
                Estimated arrival: {15 - currentStage * 3} minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveOrderTracking;
