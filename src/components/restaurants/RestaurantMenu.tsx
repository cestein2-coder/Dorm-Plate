import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Clock, DollarSign } from 'lucide-react';
import { restaurantHelpers } from '../../lib/mvp-supabase';
import type { Restaurant, MenuItem } from '../../lib/mvp-types';

interface RestaurantMenuProps {
  restaurantId: string;
  onBack?: () => void;
}

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ restaurantId, onBack }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant details and menu in parallel
      const [restaurantResult, menuResult] = await Promise.all([
        restaurantHelpers.getRestaurant(restaurantId),
        restaurantHelpers.getRestaurantMenu(restaurantId)
      ]);

      if (restaurantResult.error) throw restaurantResult.error;
      if (menuResult.error) throw menuResult.error;

      setRestaurant(restaurantResult.data);
      setMenuItems(menuResult.data || []);
      
      // Set default category to first available
      const categories = [...new Set((menuResult.data || []).map(item => item.category))];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menu_item_id === menuItem.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.menu_item_id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, {
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menu_item_id === menuItemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.menu_item_id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      
      return prev.filter(item => item.menu_item_id !== menuItemId);
    });
  };

  const getItemQuantity = (menuItemId: string) => {
    const item = cart.find(item => item.menu_item_id === menuItemId);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Group menu items by category
  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading restaurant</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadRestaurantData}
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
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="flex items-center py-4">
            <button
              onClick={onBack || (() => window.history.back())}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back to restaurants</span>
            </button>
          </div>

          {/* Restaurant Info */}
          <div className="pb-6">
            <div className="flex items-start space-x-4">
              <img 
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'} 
                alt={restaurant.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 mb-3">{restaurant.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{restaurant.rating.toFixed(1)} ({restaurant.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{restaurant.estimated_delivery_time_minutes} min delivery</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>${restaurant.delivery_fee} delivery fee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex space-x-1 border-b">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    selectedCategory === category
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Controls */}
                  <div className="flex items-center space-x-3 ml-4">
                    {getItemQuantity(item.id) > 0 ? (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-lg min-w-[2rem] text-center">
                          {getItemQuantity(item.id)}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.is_available}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          item.is_available
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {item.is_available ? 'Add' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary (Fixed Bottom) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {cartItemCount}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  ${cartTotal.toFixed(2)} subtotal
                </p>
                <p className="text-sm text-gray-600">
                  Plus ${restaurant.delivery_fee} delivery fee
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Navigate to checkout - you'll implement this
                console.log('Navigate to checkout with cart:', cart);
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;




