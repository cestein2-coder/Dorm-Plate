import { useState, useEffect, useRef } from 'react';
import { Refrigerator, Plus, Trash2, AlertCircle, Clock, CheckCircle, Sparkles, Loader2, ClipboardList } from 'lucide-react';
import { fridgeItemHelpers } from '../../lib/mvp-supabase';
import { fridgeAlertAI, RecipeSuggestion } from '../../lib/gemini-service';

interface FridgeItem {
  id: string;
  item_name: string;
  category: 'dairy' | 'meat' | 'produce' | 'leftovers' | 'beverages' | 'meals' | 'other';
  quantity?: string;
  purchase_date?: string;
  expiration_date: string;
  is_expired: boolean;
  notes?: string;
  created_at: string;
}

export default function FridgeTracker() {
  console.log('[FridgeTracker] Component mounting...');
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<RecipeSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const hasGeneratedSuggestions = useRef(false);
  const [showProduceList, setShowProduceList] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'other' as const,
    quantity: '',
    expiration_date: '',
    notes: ''
  });

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    console.log('[FridgeTracker] useEffect - calling loadFridgeItems');
    loadFridgeItems();
  }, []);

  useEffect(() => {
    // Auto-generate AI suggestions when items are expiring soon
    const expiringSoon = items.filter(item => 
      !item.is_expired && getDaysUntilExpiration(item.expiration_date) <= 3
    );
    
    console.log('[FridgeTracker] Items check:', {
      totalItems: items.length,
      expiringSoon: expiringSoon.length,
      hasGenerated: hasGeneratedSuggestions.current,
      isLoading: loadingSuggestions,
      items: expiringSoon.map(i => ({ name: i.item_name, days: getDaysUntilExpiration(i.expiration_date) }))
    });
    
    // Only auto-generate once when we first detect expiring items
    // Removed auto-generation - let users trigger manually
    if (expiringSoon.length === 0) {
      // Reset flag if no expiring items
      console.log('[FridgeTracker] No expiring items, resetting...');
      hasGeneratedSuggestions.current = false;
      setAiSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const generateAISuggestions = async (expiringItems: FridgeItem[]) => {
    console.log('[FridgeTracker] generateAISuggestions called with:', expiringItems);
    setLoadingSuggestions(true);
    setAiSuggestions([]); // Clear previous suggestions
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('[FridgeTracker] AI generation timeout - setting fallback suggestions');
      setAiSuggestions([{
        title: 'Quick Use Recipe',
        description: 'Use your expiring ingredients in a simple dish',
        urgency: 'high' as const,
        itemsToUse: expiringItems.map(i => i.item_name),
        quickTip: 'Cook these items within 24 hours to prevent waste'
      }]);
      setLoadingSuggestions(false);
    }, 15000); // 15 second timeout
    
    try {
      const itemsData = expiringItems.map(item => ({
        name: item.item_name,
        daysUntilExpiry: getDaysUntilExpiration(item.expiration_date)
      }));
      
      console.log('[FridgeTracker] Calling fridgeAlertAI.suggestRecipesForExpiring...');
      const suggestions = await fridgeAlertAI.suggestRecipesForExpiring(itemsData);
      console.log('[FridgeTracker] AI suggestions received:', suggestions);
      
      clearTimeout(timeoutId); // Clear timeout if successful
      setAiSuggestions(suggestions);
      setLoadingSuggestions(false);
    } catch (error) {
      console.error('[FridgeTracker] Error generating AI suggestions:', error);
      clearTimeout(timeoutId);
      // Set fallback suggestions on error
      setAiSuggestions([{
        title: 'Use Expiring Items',
        description: 'Create a meal with your expiring ingredients',
        urgency: 'high' as const,
        itemsToUse: expiringItems.map(i => i.item_name),
        quickTip: 'Try a stir-fry, soup, or casserole with these ingredients'
      }]);
      setLoadingSuggestions(false);
    }
  };

  const loadFridgeItems = async () => {
    console.log('[FridgeTracker] Loading fridge items...');
    setLoading(true);
    
    // Add a timeout to prevent hanging forever
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Loading timeout')), 10000); // 10 second timeout
    });
    
    try {
      const loadPromise = fridgeItemHelpers.getFridgeItems();
      const { data, error } = await Promise.race([loadPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('[FridgeTracker] Error loading items:', error);
      }
      if (data) {
        console.log('[FridgeTracker] Loaded items:', data);
        setItems(data);
      } else {
        console.log('[FridgeTracker] No items found');
        setItems([]);
      }
    } catch (err) {
      console.error('[FridgeTracker] Exception loading items:', err);
      setItems([]); // Set empty array on timeout/error so component renders
    } finally {
      setLoading(false);
      console.log('[FridgeTracker] Loading complete');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.item_name || !newItem.expiration_date) {
      alert('Please fill in item name and expiration date');
      return;
    }

    const { data, error } = await fridgeItemHelpers.createFridgeItem({
      item_name: newItem.item_name,
      category: newItem.category,
      quantity: newItem.quantity || undefined,
      expiration_date: newItem.expiration_date,
      notes: newItem.notes || undefined
    });

    if (error) {
      alert('Error adding item: ' + error.message);
      return;
    }

    if (data) {
      setItems([...items, data]);
      setNewItem({
        item_name: '',
        category: 'other',
        quantity: '',
        expiration_date: '',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Remove this item from your fridge?')) return;

    const { error } = await fridgeItemHelpers.deleteFridgeItem(itemId);
    if (!error) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleMarkExpired = async (itemId: string) => {
    const { data, error } = await fridgeItemHelpers.markAsExpired(itemId);
    if (!error && data) {
      setItems(items.map(item => item.id === itemId ? data : item));
    }
  };

  const getExpirationStatus = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate);
    if (days < 0) return { text: 'Expired', color: 'text-red-600 bg-red-100', icon: AlertCircle };
    if (days === 0) return { text: 'Expires today', color: 'text-orange-600 bg-orange-100', icon: AlertCircle };
    if (days <= 3) return { text: `${days} days left`, color: 'text-orange-600 bg-orange-100', icon: Clock };
    return { text: `${days} days left`, color: 'text-green-600 bg-green-100', icon: CheckCircle };
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      dairy: '🥛',
      meat: '🥩',
      produce: '🥬',
      leftovers: '🍱',
      beverages: '🥤',
      other: '🍽️'
    };
    return icons[category] || '🍽️';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      dairy: 'bg-blue-50 border-blue-200',
      meat: 'bg-red-50 border-red-200',
      produce: 'bg-green-50 border-green-200',
      leftovers: 'bg-orange-50 border-orange-200',
      beverages: 'bg-purple-50 border-purple-200',
      other: 'bg-gray-50 border-gray-200'
    };
    return colors[category] || 'bg-gray-50 border-gray-200';
  };

  console.log('[FridgeTracker] Rendering. Loading:', loading, 'Items:', items.length);

  if (loading) {
    console.log('[FridgeTracker] Showing loading spinner');
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-food-orange mb-4"></div>
        <p className="text-gray-600">Loading your fridge items...</p>
      </div>
    );
  }

  console.log('[FridgeTracker] Rendering main content');

  // Filter and sort items
  const activeItems = items.filter(item => !item.is_expired);
  const expiringSoon = activeItems.filter(item => getDaysUntilExpiration(item.expiration_date) <= 3);
  const expiringProduce = expiringSoon.filter(item => item.category === 'produce');
  
  console.log('[FridgeTracker] Active items:', activeItems.length, 'Expiring soon:', expiringSoon.length, 'Expiring produce:', expiringProduce.length);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'low': return 'border-l-4 border-yellow-500 bg-yellow-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-food-orange rounded-lg p-2">
            <Refrigerator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-food-brown">My Fridge</h2>
            <p className="text-sm text-gray-600">Track expiration dates & reduce waste</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-food-orange text-white px-4 py-2 rounded-lg hover:bg-food-orange-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                {expiringSoon.length} {expiringSoon.length === 1 ? 'item' : 'items'} expiring soon!
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Use {expiringSoon.length === 1 ? 'it' : 'them'} soon to avoid food waste
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Produce List */}
      {expiringProduce.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-food-brown flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-green-600" />
              Expiring Produce List
            </h3>
            <button
              onClick={() => setShowProduceList(!showProduceList)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {showProduceList ? 'Hide' : 'Show'} ({expiringProduce.length})
            </button>
          </div>
          
          {showProduceList && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 mb-3">
                Use these produce items soon to prevent waste and maintain freshness:
              </p>
              <div className="bg-white rounded-lg divide-y divide-gray-200">
                {expiringProduce.map((item) => {
                  const status = getExpirationStatus(item.expiration_date);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">🥬</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-food-brown">{item.item_name}</h4>
                          {item.quantity && (
                            <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{status.text}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                <p className="text-sm font-semibold text-food-brown mb-2">💡 Quick Tips:</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Cook produce items in a stir-fry or soup</li>
                  <li>Blend them into smoothies or sauces</li>
                  <li>Share with neighbors or friends if you can't use them</li>
                  <li>Generate meal ideas below using these items</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Recipe Suggestions for Expiring Items - Always visible */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-food-brown flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
            Fridge Overflow Alerts
          </h3>
          {loadingSuggestions && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          )}
        </div>
        
        {expiringSoon.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">All Clear! 🎉</p>
            <p className="text-sm text-gray-600">
              No items expiring within the next 3 days. Add items with upcoming expiration dates to get AI-powered recipe suggestions.
            </p>
          </div>
        ) : loadingSuggestions ? (
          <div className="flex items-center justify-center py-8 text-gray-600">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-sm">Creating recipe suggestions for your expiring items...</p>
            </div>
          </div>
        ) : aiSuggestions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 text-sm mb-4">
              Ready to generate recipe ideas for your {expiringSoon.length} expiring {expiringSoon.length === 1 ? 'item' : 'items'}.
            </p>
            <button
              onClick={() => {
                hasGeneratedSuggestions.current = false; // Reset flag to allow regeneration
                generateAISuggestions(expiringSoon);
              }}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Generate Recipe Ideas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${getUrgencyColor(suggestion.urgency)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-food-brown">{suggestion.title}</h4>
                  <span className="text-xs px-2 py-1 bg-white rounded-full font-medium capitalize">
                    {suggestion.urgency} priority
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Use:</strong> {suggestion.itemsToUse.join(', ')}</p>
                  <p><strong>Tip:</strong> {suggestion.quickTip}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                hasGeneratedSuggestions.current = false; // Reset flag
                generateAISuggestions(expiringSoon);
              }}
              className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm"
            >
              Regenerate Ideas
            </button>
          </div>
        )}
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-food-brown mb-4">Add New Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  placeholder="e.g., Milk, Chicken breast"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                >
                  <option value="dairy">🥛 Dairy</option>
                  <option value="meat">🥩 Meat</option>
                  <option value="produce">🥬 Produce</option>
                  <option value="leftovers">🍱 Leftovers</option>
                  <option value="meals">🍽️ Meals</option>
                  <option value="beverages">🥤 Beverages</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="e.g., 1 gallon, 2 lbs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  value={newItem.expiration_date}
                  onChange={(e) => setNewItem({ ...newItem, expiration_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Optional notes..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-food-orange text-white rounded-lg hover:bg-food-orange-dark transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {activeItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Refrigerator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Your fridge is empty</p>
          <p className="text-sm text-gray-500 mt-1">Add items to track their expiration dates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeItems.map((item) => {
            const status = getExpirationStatus(item.expiration_date);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-4 ${getCategoryColor(item.category)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <div>
                      <h3 className="font-semibold text-food-brown">{item.item_name}</h3>
                      {item.quantity && (
                        <p className="text-xs text-gray-600">{item.quantity}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${status.color}`}>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{status.text}</span>
                  </div>
                  <span className="text-xs">
                    {new Date(item.expiration_date).toLocaleDateString()}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">{item.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
