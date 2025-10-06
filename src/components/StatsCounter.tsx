import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, Utensils, Award } from 'lucide-react';

interface Stat {
  id: number;
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: Stat[] = [
  {
    id: 1,
    icon: <Users className="h-8 w-8" />,
    value: 25000,
    suffix: '+',
    label: 'Active Students',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    icon: <Utensils className="h-8 w-8" />,
    value: 150,
    suffix: '+',
    label: 'Restaurant Partners',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 3,
    icon: <TrendingUp className="h-8 w-8" />,
    value: 500000,
    suffix: '+',
    label: 'Orders Delivered',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 4,
    icon: <Award className="h-8 w-8" />,
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    color: 'from-yellow-500 to-yellow-600'
  }
];

interface CounterProps {
  end: number;
  duration: number;
  suffix: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <span className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
};

const StatsCounter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by Students Nationwide
          </h2>
          <p className="text-xl text-gray-300">
            Join thousands of students already enjoying convenient food delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              style={{
                animation: isVisible ? `slideUp 0.6s ease-out ${index * 0.1}s both` : 'none'
              }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full mb-4`}>
                {stat.icon}
              </div>

              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {isVisible ? (
                  <AnimatedCounter
                    end={stat.value}
                    duration={2000}
                    suffix={stat.suffix}
                  />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>

              <div className="text-gray-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Trusted by students at</p>
          <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm font-semibold">
            <div>MIT</div>
            <div>Stanford</div>
            <div>Harvard</div>
            <div>UC Berkeley</div>
            <div>University of Illinois</div>
            <div>NYU</div>
            <div>and 45+ more campuses</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default StatsCounter;
