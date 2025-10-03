import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, DollarSign, Filter } from 'lucide-react';
import { restaurantHelpers } from '../../lib/mvp-supabase';
import type { Restaurant } from '../../lib/mvp-types';
import RestaurantCard from './RestaurantCard';

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const cuisineTypes = ['All', 'American', 'Chinese', 'Italian', 'Healthy', 'Mexican', 'Thai', 'Japanese'];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await restaurantHelpers.getAllRestaurants();
      
      if (error) throw error;
      
      setRestaurants(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadRestaurants();
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await restaurantHelpers.searchRestaurants(query);
      
      if (error) throw error;
      
      setRestaurants(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (selectedCuisine && selectedCuisine !== 'All') {
      return restaurant.cuisine_type === selectedCuisine;
    }
    return true;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading restaurants</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadRestaurants}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Order Food on Campus
          </h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Cuisine:</span>
            </div>
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine === 'All' ? '' : cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  (selectedCuisine === cuisine) || (cuisine === 'All' && !selectedCuisine)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">
              {searchQuery ? 'No restaurants found' : 'No restaurants available'}
            </div>
            <p className="text-gray-400">
              {searchQuery ? 'Try a different search term' : 'Check back later for new restaurants'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Delivery Time</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>Delivery Fee</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;




