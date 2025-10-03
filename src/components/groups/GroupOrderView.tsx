import React, { useState, useEffect } from 'react';
import { Users, Copy, Clock, DollarSign, UserPlus, CheckCircle } from 'lucide-react';
import { groupOrderHelpers } from '../../lib/mvp-supabase';
import { useAuth } from '../auth/AuthProvider';
import type { GroupOrder } from '../../lib/mvp-types';

interface GroupOrderViewProps {
  joinCode: string;
}

const GroupOrderView: React.FC<GroupOrderViewProps> = ({ joinCode }) => {
  const { user, profile } = useAuth();
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadGroupOrder();
  }, [joinCode]);

  const loadGroupOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await groupOrderHelpers.getGroupOrder(joinCode);
      
      if (error) throw error;
      
      setGroupOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      setError('Please sign in to join this group order');
      return;
    }

    try {
      setJoining(true);
      setError(null);
      
      const { error } = await groupOrderHelpers.joinGroupOrder(joinCode);
      
      if (error) throw error;
      
      // Reload group order to show updated participants
      await loadGroupOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = joinCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isParticipant = groupOrder?.participants?.some(p => p.user_id === user?.id);
  const isOrganizer = groupOrder?.organizer_user_id === user?.id;
  const participantCount = groupOrder?.participants?.length || 0;
  const maxParticipants = groupOrder?.max_participants || 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group order...</p>
        </div>
      </div>
    );
  }

  if (error || !groupOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-xl mb-4">Group Order Not Found</div>
          <p className="text-gray-600 mb-4">
            {error || 'This group order may have expired or the join code is invalid.'}
          </p>
          <button 
            onClick={() => window.location.href = '/restaurants'}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                {groupOrder.group_name}
              </h1>
              <p className="text-gray-600">
                Group order from {groupOrder.order?.restaurant?.name}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                groupOrder.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {groupOrder.status === 'open' ? 'Open for Joining' : 'Closed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Share with Friends</h2>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">Join Code</div>
                  <div className="text-2xl font-bold text-gray-900 tracking-wider">
                    {joinCode}
                  </div>
                </div>
                <button
                  onClick={copyJoinCode}
                  className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Share this code with friends so they can join your group order
              </p>
            </div>

            {/* Order Details */}
            {groupOrder.order && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                
                {/* Restaurant Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={groupOrder.order.restaurant?.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'} 
                    alt={groupOrder.order.restaurant?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {groupOrder.order.restaurant?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {groupOrder.order.restaurant?.cuisine_type}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{groupOrder.order.restaurant?.estimated_delivery_time_minutes} min</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${groupOrder.order.restaurant?.delivery_fee} delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-gray-600">{groupOrder.order.delivery_address}</p>
                  {groupOrder.order.delivery_instructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      Instructions: {groupOrder.order.delivery_instructions}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                  <div className="space-y-2">
                    {groupOrder.order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
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
                  </div>

                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${groupOrder.order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${groupOrder.order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${groupOrder.order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${groupOrder.order.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-600 text-center mt-2">
                      Split between {participantCount} participant{participantCount !== 1 ? 's' : ''}: 
                      <span className="font-semibold ml-1">
                        ${(groupOrder.order.total / participantCount).toFixed(2)} each
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Group */}
            {!isParticipant && groupOrder.status === 'open' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Group</h3>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">By joining this group order, you'll:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Split the delivery fee with other participants</li>
                      <li>Get the same food delivered together</li>
                      <li>Pay your share of the total cost</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleJoinGroup}
                    disabled={joining || !user}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {joining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Join Group Order
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="text-sm text-gray-500 text-center">
                      Please sign in to join this group order
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participants ({participantCount}/{maxParticipants})
              </h3>
              
              <div className="space-y-3">
                {groupOrder.participants?.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold text-sm">
                          {participant.user_profile?.first_name?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.user_profile?.first_name} {participant.user_profile?.last_name}
                          {participant.user_id === groupOrder.organizer_user_id && (
                            <span className="text-xs text-red-600 ml-2">(Organizer)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {participant.user_profile?.university}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {participant.payment_status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {participantCount < maxParticipants && groupOrder.status === 'open' && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 text-center">
                    {maxParticipants - participantCount} more spot{maxParticipants - participantCount !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}
            </div>

            {/* Group Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    groupOrder.status === 'open' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {groupOrder.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                {groupOrder.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires</span>
                    <span className="font-medium text-gray-900">
                      {new Date(groupOrder.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(groupOrder.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupOrderView;




