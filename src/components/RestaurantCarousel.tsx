import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  priceRange: string;
}

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Campus Burgers",
    cuisine: "American",
    rating: 4.8,
    deliveryTime: "12-15 min",
    image: "🍔",
    priceRange: "$$"
  },
  {
    id: 2,
    name: "Sushi Express",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "20-25 min",
    image: "🍱",
    priceRange: "$$$"
  },
  {
    id: 3,
    name: "Pizza Paradise",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "15-20 min",
    image: "🍕",
    priceRange: "$$"
  },
  {
    id: 4,
    name: "Taco Haven",
    cuisine: "Mexican",
    rating: 4.6,
    deliveryTime: "10-15 min",
    image: "🌮",
    priceRange: "$"
  },
  {
    id: 5,
    name: "Healthy Bowl Co.",
    cuisine: "Healthy",
    rating: 4.8,
    deliveryTime: "15-18 min",
    image: "🥗",
    priceRange: "$$"
  }
];

const RestaurantCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % restaurants.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + restaurants.length) % restaurants.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % restaurants.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Popular Restaurants Near You
          </h2>
          <p className="text-xl text-gray-600">
            Explore the best food spots on campus
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="min-w-full">
                  <div className="p-8 text-center">
                    <div className="text-8xl mb-6">{restaurant.image}</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">{restaurant.cuisine}</p>

                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{restaurant.deliveryTime}</span>
                      </div>
                      <span className="text-gray-600 font-medium">{restaurant.priceRange}</span>
                    </div>

                    <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all">
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-10"
            aria-label="Previous restaurant"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-10"
            aria-label="Next restaurant"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center space-x-2 mt-6">
            {restaurants.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-red-500'
                    : 'w-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantCarousel;
