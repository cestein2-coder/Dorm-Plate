import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Bell, Calendar, TrendingDown, Flame, Utensils, LogOut, Menu, X, 
  Sparkles, Users, Award, Leaf, DollarSign, Home, Refrigerator 
} from 'lucide-react';
import { dashboardHelpers } from '../lib/mvp-supabase';
import { useAuth } from './auth/AuthProvider';
import FridgeTracker from './fridge/FridgeTracker';
import SmartMealPlanner from './meal-planner/SmartMealPlanner';
import CommunityFeed from './community/CommunityFeed';
import CreatePostModal from './community/CreatePostModal';

type DashboardView = 'home' | 'meal-planner' | 'fridge' | 'dining-sync' | 'waste-dashboard' | 'community';

const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Interactive states for Campus Dining Sync
  const [selectedDiningHall, setSelectedDiningHall] = useState<string | null>(null);
  
  // Interactive states for Waste Dashboard
  const [selectedGoal, setSelectedGoal] = useState<'waste' | 'savings'>('waste');
  
  // Interactive states for Community
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [communityRefreshKey, setCommunityRefreshKey] = useState(0);
  
  // Interactive states for Achievements
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  
  // Interactive states for Sustainability Tips
  const [markedTips, setMarkedTips] = useState<Set<number>>(new Set());

  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false);
      await signOut();
      // User will be redirected to landing page automatically
    } catch (error) {
      console.error('Sign out error:', error);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
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
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setCurrentView('meal-planner')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'meal-planner' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>Meal Planner</span>
              </button>
              <button
                onClick={() => setCurrentView('fridge')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'fridge' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Fridge Alerts</span>
              </button>
              <button
                onClick={() => setCurrentView('dining-sync')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dining-sync' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Dining Sync</span>
              </button>
              <button
                onClick={() => setCurrentView('waste-dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'waste-dashboard' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <TrendingDown className="h-4 w-4" />
                <span>Impact</span>
              </button>
              <button
                onClick={() => setCurrentView('community')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'community' ? 'bg-food-orange text-white' : 'text-food-brown hover:text-food-orange'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.first_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.university || 'Student'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-food-brown hover:text-food-orange"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t py-4 space-y-2">
              {[
                { view: 'home', icon: '🏠', label: 'Home' },
                { view: 'meal-planner', icon: '👨‍🍳', label: 'Meal Planner' },
                { view: 'fridge', icon: '🔔', label: 'Fridge Alerts' },
                { view: 'dining-sync', icon: '📅', label: 'Dining Sync' },
                { view: 'waste-dashboard', icon: '📊', label: 'Impact Dashboard' },
                { view: 'community', icon: '👥', label: 'Community Picks' }
              ].map(item => (
                <button
                  key={item.view}
                  onClick={() => { setCurrentView(item.view as DashboardView); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-food-orange hover:text-white rounded-lg transition-colors font-medium"
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="border-t pt-3 mt-3 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.first_name || user?.email?.split('@')[0]}
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
          
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-food-orange to-food-green rounded-2xl shadow-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">
                  Welcome to DormPlate, {profile?.first_name || 'Student'}! 🎉
                </h1>
                <p className="text-lg opacity-90">
                  Your smart meal planning companion for sustainable campus living
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Smart Meal Planner Card */}
                <button
                  onClick={() => setCurrentView('meal-planner')}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-food-orange hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-food-orange transition-colors">
                      <ChefHat className="h-8 w-8 text-food-orange group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-food-brown">Smart Meal Planner</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    AI-powered meal suggestions based on what's in your fridge. Snap a photo or enter ingredients.
                  </p>
                </button>

                {/* Fridge Overflow Alerts Card */}
                <button
                  onClick={() => setCurrentView('fridge')}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-orange-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-400 transition-colors">
                      <Bell className="h-8 w-8 text-orange-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-food-brown">Fridge Overflow Alerts</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Get notified before food spoils. Schedule reminders to eat or share items.
                  </p>
                </button>

                {/* Campus Dining Sync Card */}
                <button
                  onClick={() => setCurrentView('dining-sync')}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-blue-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-400 transition-colors">
                      <Calendar className="h-8 w-8 text-blue-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-food-brown">Campus Dining Sync</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Sync with meal plans and dining calendars. Balance credits and meal planning.
                  </p>
                </button>

                {/* Waste Reduction Dashboard Card */}
                <button
                  onClick={() => setCurrentView('waste-dashboard')}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-food-green hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-food-green transition-colors">
                      <TrendingDown className="h-8 w-8 text-food-green group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-food-brown">Waste Reduction Dashboard</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Track money saved, food waste reduced, and carbon impact over time.
                  </p>
                </button>

                {/* Community Picks Card */}
                <button
                  onClick={() => setCurrentView('community')}
                  className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-purple-400 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-400 transition-colors">
                      <Users className="h-8 w-8 text-purple-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-food-brown">Community Picks</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    See trending meals from other students. Like, save, and replicate recipes.
                  </p>
                </button>

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl shadow-md p-6 border-2 border-amber-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="h-8 w-8 text-amber-600" />
                    <h3 className="text-xl font-bold text-food-brown">Your Impact</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-2xl text-food-orange">$45</span> saved this month
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-2xl text-food-green">8 lbs</span> waste prevented
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEAL PLANNER VIEW */}
          {currentView === 'meal-planner' && <SmartMealPlanner />}

          {/* FRIDGE OVERFLOW ALERTS VIEW */}
          {currentView === 'fridge' && <FridgeTracker />}

          {/* CAMPUS DINING SYNC VIEW */}
          {currentView === 'dining-sync' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-food-brown">Campus Dining Sync</h2>
                <p className="text-gray-600 mt-1">Balance meal plans, dining credits, and sustainability</p>
              </div>

              {/* Meal Plan Balance */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-food-brown">Your Meal Plan</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Dining Dollars</p>
                    <p className="text-2xl font-bold text-blue-600">$450</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Meal Swipes</p>
                    <p className="text-2xl font-bold text-food-green">12 left</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Guest Passes</p>
                    <p className="text-2xl font-bold text-food-orange">3 left</p>
                  </div>
                </div>
              </div>

              {/* Today's Dining Options */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-food-brown mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Today's Dining Hours
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'isdc', hall: 'Illinois Street Dining Center', hours: '7:00 AM - 9:00 PM', distance: '0.2 miles', status: 'Open' },
                    { id: 'par', hall: 'Pennsylvania Avenue (PAR)', hours: '7:00 AM - 8:00 PM', distance: '0.5 miles', status: 'Open' },
                    { id: 'fog', hall: 'Field of Greens', hours: '11:00 AM - 7:00 PM', distance: '0.3 miles', status: 'Open' }
                  ].map((hall) => (
                    <button
                      key={hall.id}
                      onClick={() => setSelectedDiningHall(selectedDiningHall === hall.id ? null : hall.id)}
                      className={`w-full border rounded-lg p-4 transition-all text-left ${
                        selectedDiningHall === hall.id 
                          ? 'border-blue-400 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-food-brown">{hall.hall}</p>
                          <p className="text-sm text-gray-600">⏰ {hall.hours}</p>
                          <p className="text-sm text-gray-500">📍 {hall.distance} away</p>
                          {selectedDiningHall === hall.id && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-sm font-medium text-blue-700 mb-2">Quick Actions:</p>
                              <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors">
                                  📍 Get Directions
                                </button>
                                <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors">
                                  🍽️ View Menu
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {hall.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cook vs Dine Recommendation */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-food-brown mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                  Smart Recommendation
                </h3>
                <p className="text-gray-700 mb-4">
                  Based on your meal plan balance and fridge inventory, we recommend <strong>cooking at home tonight</strong> to save your dining dollars for the weekend!
                </p>
                <button className="bg-food-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors">
                  See Meal Ideas from Your Fridge →
                </button>
              </div>
            </div>
          )}

          {/* WASTE REDUCTION DASHBOARD VIEW */}
          {currentView === 'waste-dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-food-brown">Waste Reduction Dashboard</h2>
                <p className="text-gray-600 mt-1">Track your impact on sustainability and savings</p>
              </div>

              {/* Impact Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-food-green">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-10 w-10 text-food-green" />
                    <span className="text-sm text-gray-500">This Month</span>
                  </div>
                  <p className="text-3xl font-bold text-food-green mb-1">$45.50</p>
                  <p className="text-sm text-gray-600">Money Saved</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-400">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingDown className="h-10 w-10 text-orange-400" />
                    <span className="text-sm text-gray-500">This Month</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400 mb-1">8.2 lbs</p>
                  <p className="text-sm text-gray-600">Food Waste Prevented</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-4">
                    <Leaf className="h-10 w-10 text-blue-400" />
                    <span className="text-sm text-gray-500">This Month</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400 mb-1">12.5 kg</p>
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-food-brown">Monthly Progress</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedGoal('waste')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedGoal === 'waste'
                          ? 'bg-food-green text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Waste Goal
                    </button>
                    <button
                      onClick={() => setSelectedGoal('savings')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedGoal === 'savings'
                          ? 'bg-food-orange text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Savings Goal
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedGoal === 'waste' ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Waste Reduction Goal</span>
                        <span className="font-semibold text-food-green">82%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:h-4 transition-all">
                        <div className="bg-food-green rounded-full h-3 hover:h-4 transition-all" style={{ width: '82%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">🎯 Goal: Reduce 10 lbs by end of month • You're almost there!</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Savings Goal ($50)</span>
                        <span className="font-semibold text-food-orange">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:h-4 transition-all">
                        <div className="bg-food-orange rounded-full h-3 hover:h-4 transition-all" style={{ width: '91%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">💰 Goal: Save $50 by end of month • Just $4.50 more to go!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-food-brown mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  Your Achievements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { badge: '🌟', title: 'First Week', desc: 'Completed', details: 'Successfully completed your first week using DormPlate! Keep up the great work!' },
                    { badge: '🥇', title: 'Top Saver', desc: 'Top 10%', details: `You're in the top 10% of students saving money on meals. You've saved $87 this month!` },
                    { badge: '♻️', title: 'Eco Warrior', desc: '20 items saved', details: `Prevented 20 food items from going to waste. That's 12 lbs of food saved from landfills!` },
                    { badge: '🎯', title: 'Goal Crusher', desc: 'Hit 3 goals', details: 'Achieved 3 sustainability goals this month. Your next goal: Save 5 more meals!' }
                  ].map((achievement, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAchievement(selectedAchievement === idx ? null : idx)}
                      className={`bg-white rounded-lg p-4 text-center transition-all ${
                        selectedAchievement === idx 
                          ? 'shadow-lg scale-105 ring-2 ring-amber-500' 
                          : 'hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className="text-4xl mb-2">{achievement.badge}</div>
                      <p className="font-semibold text-food-brown text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.desc}</p>
                      {selectedAchievement === idx && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                          {achievement.details}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sustainability Tips */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-food-brown mb-4 flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-orange-500" />
                  Sustainability Tips
                </h3>
                <div className="space-y-3">
                  {[
                    'Meal prep on Sundays to reduce food waste during busy weeks',
                    'Store herbs in water like flowers to keep them fresh longer',
                    'Freeze leftovers within 2 hours to maintain quality and safety'
                  ].map((tip, idx) => {
                    const isMarked = markedTips.has(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const newMarked = new Set(markedTips);
                          if (isMarked) {
                            newMarked.delete(idx);
                          } else {
                            newMarked.add(idx);
                          }
                          setMarkedTips(newMarked);
                        }}
                        className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-all text-left ${
                          isMarked 
                            ? 'bg-green-100 border-2 border-green-500' 
                            : 'bg-green-50 hover:bg-green-100 border-2 border-transparent'
                        }`}
                      >
                        <span className={`text-xl transition-all ${isMarked ? 'text-green-600' : 'text-gray-400'}`}>
                          {isMarked ? '✓' : '○'}
                        </span>
                        <div className="flex-1">
                          <p className={`text-sm ${isMarked ? 'text-gray-600 line-through' : 'text-gray-700'}`}>
                            {tip}
                          </p>
                          {isMarked && (
                            <p className="text-xs text-green-600 mt-1">Marked as helpful!</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* COMMUNITY PICKS VIEW */}
          {currentView === 'community' && (
            <CommunityFeed 
              key={communityRefreshKey}
              onCreatePost={() => setIsCreatePostModalOpen(true)} 
            />
          )}

        </div>
      </div>
      
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          setCommunityRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default Dashboard;
