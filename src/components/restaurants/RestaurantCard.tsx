import React from 'react';
import { Star, Clock, DollarSign, MapPin } from 'lucide-react';
import type { Restaurant } from '../../lib/mvp-types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation to restaurant page
      window.location.href = `/restaurant/${restaurant.id}`;
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Restaurant Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'} 
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            restaurant.is_accepting_orders 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {restaurant.is_accepting_orders ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Delivery Fee Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            ${restaurant.delivery_fee} delivery
          </span>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
            {restaurant.name}
          </h3>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700 ml-1">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              ({restaurant.review_count})
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {restaurant.description || `Delicious ${restaurant.cuisine_type} cuisine`}
        </p>

        {/* Restaurant Details */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {restaurant.cuisine_type}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{restaurant.estimated_delivery_time_minutes} min</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${restaurant.min_order_amount} min</span>
            </div>
          </div>
        </div>

        {/* Order Button */}
        <button 
          className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
            restaurant.is_accepting_orders
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!restaurant.is_accepting_orders}
        >
          {restaurant.is_accepting_orders ? 'View Menu' : 'Currently Closed'}
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;




