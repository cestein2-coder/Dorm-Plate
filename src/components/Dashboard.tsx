import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Star, TrendingUp, Users, Search } from 'lucide-react';
import { dashboardHelpers } from '../lib/mvp-supabase';
import { useAuth } from './auth/AuthProvider';
import RestaurantList from './restaurants/RestaurantList';
import OrderTracking from './orders/OrderTracking';
import GroupOrderView from './groups/GroupOrderView';

type DashboardView = 'restaurants' | 'orders' | 'group' | 'order-tracking';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('restaurants');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [groupJoinCode, setGroupJoinCode] = useState<string>('');

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

  const handleJoinGroup = (joinCode: string) => {
    setGroupJoinCode(joinCode);
    setCurrentView('group');
  };

  // If user is not logged in, show the landing page content
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Public Restaurant Browse */}
        <RestaurantList />
      </div>
    );
  }

  // Render specific views
  if (currentView === 'order-tracking' && selectedOrderId) {
    return (
      <OrderTracking 
        orderId={selectedOrderId} 
        onBack={() => setCurrentView('orders')} 
      />
    );
  }

  if (currentView === 'group' && groupJoinCode) {
    return (
      <GroupOrderView joinCode={groupJoinCode} />
    );
  }

  if (currentView === 'restaurants') {
    return <RestaurantList />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.first_name}!
              </h1>
              <p className="text-gray-600">
                Ready to order some delicious food?
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('restaurants')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Restaurants
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setCurrentView('orders')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Orders
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.total_orders || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${dashboardData?.total_spent?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600" />
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
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
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
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Browse Restaurants
                  </button>
                </div>
              )}
            </div>

            {/* Group Order Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Join a Group Order
              </h2>
              <p className="text-gray-600 mb-4">
                Have a join code from a friend? Enter it below to join their group order.
              </p>
              
              <div className="flex space-x-3 max-w-md">
                <input
                  type="text"
                  placeholder="Enter join code (e.g., ABC123)"
                  value={groupJoinCode}
                  onChange={(e) => setGroupJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={() => groupJoinCode && handleJoinGroup(groupJoinCode)}
                  disabled={!groupJoinCode}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;




