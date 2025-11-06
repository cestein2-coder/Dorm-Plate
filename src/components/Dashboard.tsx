import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, DollarSign, Utensils, LogOut, Menu, X, Refrigerator, Bell } from 'lucide-react';
import { dashboardHelpers } from '../lib/mvp-supabase';
import { useAuth } from './auth/AuthProvider';
import FridgeTracker from './fridge/FridgeTracker';
import RemindersList from './reminders/RemindersList';

type DashboardView = 'home' | 'fridge' | 'reminders';

const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardHelpers.getUserDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-tracking');
  };

  if (currentView === 'order-tracking' && selectedOrderId) {
    return (
      <OrderTracking
        orderId={selectedOrderId}
        onBack={() => setCurrentView('orders')}
      />
    );
  }

  if (currentView === 'restaurants') {
    return <RestaurantList />;
  }

  if (currentView === 'fridge') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-food-orange to-food-green p-2 rounded-lg">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-food-brown">DormPlate</span>
              </div>
              <button
                onClick={() => setCurrentView('orders')}
                className="text-food-brown hover:text-food-orange font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </header>
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FridgeTracker />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-food-orange to-food-green p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-food-brown">DormPlate</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('restaurants')}
                className="text-food-brown hover:text-food-orange font-medium transition-colors flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Browse</span>
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className="text-food-brown hover:text-food-orange font-medium transition-colors flex items-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setCurrentView('fridge')}
                className="text-food-brown hover:text-food-orange font-medium transition-colors flex items-center space-x-2"
              >
                <Refrigerator className="h-4 w-4" />
                <span>My Fridge</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop Profile */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.first_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-food-brown hover:text-food-orange"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-900" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-900" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-3">
              <button
                onClick={() => {
                  setCurrentView('restaurants');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Browse Restaurants
              </button>
              <button
                onClick={() => {
                  setCurrentView('orders');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                My Orders
              </button>
              <button
                onClick={() => {
                  setCurrentView('fridge');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                My Fridge
              </button>
              <div className="border-t pt-3 mt-3 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.first_name || user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-food-orange hover:text-food-orange-dark font-medium text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.first_name || 'Student'}!
            </h1>
            <p className="text-gray-600">
              Order from your favorite campus restaurants and get delivery in 15 minutes.
            </p>
          </div>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-food-orange" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.total_orders || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-food-green" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.total_spent?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-food-brown-light rounded-lg">
                    <Star className="h-6 w-6 text-food-brown" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.total_orders > 0
                        ? (dashboardData.total_spent / dashboardData.total_orders).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-food-orange"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              </div>
              
              {dashboardData?.recent_orders?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {dashboardData.recent_orders.map((order: any) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={order.restaurant?.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'} 
                            alt={order.restaurant?.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {order.restaurant?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order #{order.order_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${order.total.toFixed(2)}
                            </p>
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'cancelled'
                                ? 'bg-orange-100 text-food-orange'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-food-orange hover:text-food-orange-dark font-medium text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by browsing restaurants and placing your first order!
                  </p>
                  <button
                    onClick={() => setCurrentView('restaurants')}
                    className="bg-food-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors"
                  >
                    Browse Restaurants
                  </button>
                </div>
              )}
            </div>

            {/* Reminders Section */}
            <RemindersList />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;




