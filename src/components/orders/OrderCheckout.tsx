import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, CreditCard, Users } from 'lucide-react';
import { orderHelpers, groupOrderHelpers } from '../../lib/mvp-supabase';
import { useAuth } from '../auth/AuthProvider';
import type { OrderFormData } from '../../lib/mvp-types';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

interface OrderCheckoutProps {
  cart: CartItem[];
  restaurantId: string;
  restaurantName: string;
  deliveryFee: number;
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

const OrderCheckout: React.FC<OrderCheckoutProps> = ({
  cart,
  restaurantId,
  restaurantName,
  deliveryFee,
  onBack,
  onOrderComplete
}) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGroupOrder, setIsGroupOrder] = useState(false);
  
  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState(
    profile?.dorm_building && profile?.room_number 
      ? `${profile.dorm_building}, Room ${profile.room_number}`
      : ''
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [groupName, setGroupName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please sign in to place an order');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    if (isGroupOrder && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData: OrderFormData = {
        restaurant_id: restaurantId,
        delivery_address: deliveryAddress,
        delivery_instructions: deliveryInstructions || undefined,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions
        }))
      };

      let result;

      if (isGroupOrder) {
        // Create group order
        result = await groupOrderHelpers.createGroupOrder(orderData, {
          group_name: groupName,
          max_participants: maxParticipants,
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        });
      } else {
        // Create individual order
        result = await orderHelpers.createOrder(orderData);
      }

      if (result.error) {
        throw result.error;
      }

      // Navigate to order confirmation
      onOrderComplete(result.data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to place your order</p>
          <button 
            onClick={onBack}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
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
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to menu</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Order from {restaurantName}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Order Type Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="orderType"
                  checked={!isGroupOrder}
                  onChange={() => setIsGroupOrder(false)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Individual Order</div>
                  <div className="text-sm text-gray-500">Order just for yourself</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="orderType"
                  checked={isGroupOrder}
                  onChange={() => setIsGroupOrder(true)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div className="ml-3 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Group Order</div>
                    <div className="text-sm text-gray-500">Share with friends and split the cost</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Group Order Settings */}
            {isGroupOrder && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Study Group Pizza Night"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <select
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} people</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your dorm, building, or address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g., Room 204, call when you arrive"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    {item.special_instructions && (
                      <p className="text-sm text-gray-500">Note: {item.special_instructions}</p>
                    )}
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Method
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💳 Payment processing will be integrated with Stripe in the next version. 
                For now, orders will be placed as "pending payment".
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !deliveryAddress.trim()}
            className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Placing Order...
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 mr-2" />
                {isGroupOrder ? 'Create Group Order' : 'Place Order'} - ${total.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Estimated delivery time: 25-35 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCheckout;




