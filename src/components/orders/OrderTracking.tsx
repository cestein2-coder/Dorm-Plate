import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, Truck, MapPin, Phone } from 'lucide-react';
import { orderHelpers, trackingHelpers } from '../../lib/mvp-supabase';
import type { Order, OrderStatusUpdate } from '../../lib/mvp-types';

interface OrderTrackingProps {
  orderId: string;
  onBack?: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadOrderData, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const [orderResult, updatesResult] = await Promise.all([
        orderHelpers.getOrder(orderId),
        trackingHelpers.getOrderUpdates(orderId)
      ]);

      if (orderResult.error) throw orderResult.error;
      if (updatesResult.error) throw updatesResult.error;

      setOrder(orderResult.data);
      setStatusUpdates(updatesResult.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case 'preparing':
        return <Clock className="h-6 w-6 text-orange-500" />;
      case 'out_for_delivery':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Food';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEstimatedDeliveryTime = () => {
    if (order?.estimated_delivery_time) {
      return new Date(order.estimated_delivery_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Calculating...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading order</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadOrderData}
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
              <p className="text-gray-600">From {order.restaurant?.name}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Estimated Delivery Time */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {order.status === 'delivered' ? 'Delivered!' : getEstimatedDeliveryTime()}
          </div>
          <p className="text-gray-600">
            {order.status === 'delivered' 
              ? 'Your order has been delivered' 
              : 'Estimated delivery time'
            }
          </p>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          
          <div className="space-y-4">
            {statusUpdates.length > 0 ? (
              statusUpdates.map((update, index) => (
                <div key={update.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {getStatusText(update.status)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatTime(update.created_at)}
                      </span>
                    </div>
                    {update.message && (
                      <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                    )}
                    {update.estimated_time && (
                      <p className="text-sm text-gray-500 mt-1">
                        ETA: {formatTime(update.estimated_time)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Default status display if no updates
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(order.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {getStatusText(order.status)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.status === 'pending' && 'We\'ve received your order and are processing it.'}
                    {order.status === 'confirmed' && 'Your order has been confirmed and sent to the restaurant.'}
                    {order.status === 'preparing' && 'The restaurant is preparing your food.'}
                    {order.status === 'out_for_delivery' && 'Your order is on its way!'}
                    {order.status === 'delivered' && 'Your order has been delivered. Enjoy your meal!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Delivery Information
          </h2>
          <div className="space-y-2">
            <p className="text-gray-900">{order.delivery_address}</p>
            {order.delivery_instructions && (
              <p className="text-sm text-gray-600">
                Instructions: {order.delivery_instructions}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {item.quantity}x {item.menu_item?.name || 'Item'}
                  </span>
                  {item.special_instructions && (
                    <p className="text-sm text-gray-500">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>
                <span className="font-medium">${item.total_price.toFixed(2)}</span>
              </div>
            ))}
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-blue-800 font-medium">Need help with your order?</p>
              <p className="text-blue-600 text-sm">
                Contact support at support@dormplate.com or call (555) 123-4567
              </p>
            </div>
          </div>
        </div>

        {/* Reorder Button */}
        {order.status === 'delivered' && (
          <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
            Reorder These Items
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;




