import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Store, Home } from 'lucide-react';

interface Location {
  x: number;
  y: number;
  label: string;
}

const DeliveryMap: React.FC = () => {
  const [driverPosition, setDriverPosition] = useState({ x: 20, y: 80 });
  const [progress, setProgress] = useState(0);

  const restaurant: Location = { x: 20, y: 80, label: 'Restaurant' };
  const destination: Location = { x: 80, y: 20, label: 'Your Dorm' };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate driver position along the path
    const t = progress / 100;
    const newX = restaurant.x + (destination.x - restaurant.x) * t;
    const newY = restaurant.y + (destination.y - restaurant.y) * t;
    setDriverPosition({ x: newX, y: newY });
  }, [progress]);

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Live Delivery Tracking
          </h2>
          <p className="text-xl text-gray-600">
            Watch your order journey from restaurant to your door
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          {/* Map Container */}
          <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-xl overflow-hidden" style={{ height: '400px' }}>
            {/* Grid lines for map effect */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Path between restaurant and destination */}
            <svg className="absolute inset-0 w-full h-full">
              <line
                x1={`${restaurant.x}%`}
                y1={`${restaurant.y}%`}
                x2={`${destination.x}%`}
                y2={`${destination.y}%`}
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="10,5"
                className="opacity-50"
              />
            </svg>

            {/* Restaurant Marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${restaurant.x}%`, top: `${restaurant.y}%` }}
            >
              <div className="relative">
                <div className="bg-red-500 text-white rounded-full p-4 shadow-xl">
                  <Store className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap text-sm font-semibold">
                  Restaurant
                </div>
              </div>
            </div>

            {/* Destination Marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
            >
              <div className="relative">
                <div className="bg-blue-500 text-white rounded-full p-4 shadow-xl">
                  <Home className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap text-sm font-semibold">
                  Your Dorm
                </div>
              </div>
            </div>

            {/* Driver Marker (Animated) */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
              style={{ left: `${driverPosition.x}%`, top: `${driverPosition.y}%` }}
            >
              <div className="relative animate-bounce">
                <div className="bg-green-500 text-white rounded-full p-3 shadow-2xl ring-4 ring-green-300 ring-opacity-50">
                  <Navigation className="h-5 w-5" />
                </div>
                {/* Pulse effect */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
              </div>
            </div>

            {/* Campus buildings decoration */}
            <div className="absolute bottom-4 left-4 text-4xl opacity-30">🏫</div>
            <div className="absolute top-4 right-4 text-4xl opacity-30">🏢</div>
            <div className="absolute top-1/2 left-1/2 text-4xl opacity-20">🌳</div>
          </div>

          {/* Status Bar */}
          <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 text-white rounded-full p-2">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Driver is on the way</div>
                <div className="text-sm text-gray-600">
                  {progress < 100 ? `${Math.round((1 - progress / 100) * 8)} minutes away` : 'Arriving now!'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryMap;
