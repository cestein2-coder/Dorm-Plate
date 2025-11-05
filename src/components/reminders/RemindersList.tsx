import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Utensils, Share2, ChefHat, Clock } from 'lucide-react';
import { reminderHelpers } from '../../lib/mvp-supabase';

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'meal' | 'share' | 'recipe';
  scheduled_for: string;
  is_completed: boolean;
  created_at: string;
}

const RemindersList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_type: 'meal' as 'meal' | 'share' | 'recipe',
    scheduled_for: ''
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await reminderHelpers.getReminders();
      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await reminderHelpers.createReminder(newReminder);
      if (error) throw error;
      
      setNewReminder({
        title: '',
        description: '',
        reminder_type: 'meal',
        scheduled_for: ''
      });
      setShowAddForm(false);
      loadReminders();
    } catch (err: any) {
      alert(err.message || 'Failed to create reminder');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      const { error } = await reminderHelpers.deleteReminder(id);
      if (error) throw error;
      loadReminders();
    } catch (err: any) {
      alert(err.message || 'Failed to delete reminder');
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const { error } = await reminderHelpers.updateReminder(id, { is_completed: !isCompleted });
      if (error) throw error;
      loadReminders();
    } catch (err: any) {
      alert(err.message || 'Failed to update reminder');
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Utensils className="h-5 w-5" />;
      case 'share':
        return <Share2 className="h-5 w-5" />;
      case 'recipe':
        return <ChefHat className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'bg-food-orange text-white';
      case 'share':
        return 'bg-food-green text-white';
      case 'recipe':
        return 'bg-food-brown text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-food-orange"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-food-orange" />
            Reminders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Schedule meal times, sharing plans, and get recipe suggestions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-food-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="p-6 border-b bg-food-cream">
          <form onSubmit={handleAddReminder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setNewReminder({ ...newReminder, reminder_type: 'meal' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newReminder.reminder_type === 'meal'
                      ? 'border-food-orange bg-orange-50'
                      : 'border-gray-200 hover:border-food-orange'
                  }`}
                >
                  <Utensils className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Eat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewReminder({ ...newReminder, reminder_type: 'share' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newReminder.reminder_type === 'share'
                      ? 'border-food-green bg-green-50'
                      : 'border-gray-200 hover:border-food-green'
                  }`}
                >
                  <Share2 className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewReminder({ ...newReminder, reminder_type: 'recipe' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newReminder.reminder_type === 'recipe'
                      ? 'border-food-brown bg-brown-50'
                      : 'border-gray-200 hover:border-food-brown'
                  }`}
                >
                  <ChefHat className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Recipe</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="e.g., Lunch with friends"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={newReminder.scheduled_for}
                onChange={(e) => setNewReminder({ ...newReminder, scheduled_for: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder="Add any notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-food-orange text-white py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors"
              >
                Create Reminder
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="divide-y divide-gray-100">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                reminder.is_completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${getReminderColor(reminder.reminder_type)}`}>
                    {getReminderIcon(reminder.reminder_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${reminder.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {reminder.reminder_type}
                      </span>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDateTime(reminder.scheduled_for)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      reminder.is_completed
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-food-green text-white hover:bg-food-green-dark'
                    }`}
                  >
                    {reminder.is_completed ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-600">
              Create your first reminder to stay organized with meals and sharing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersList;
