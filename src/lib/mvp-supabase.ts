import { createClient } from '@supabase/supabase-js';
import type { 
  StudentProfile, 
  Restaurant, 
  MenuItem, 
  Order, 
  OrderItem,
  GroupOrder,
  GroupOrderParticipant,
  Review,
  WaitlistEntry,
  OrderStatusUpdate
} from './mvp-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==============================================
// AUTH HELPERS (existing functionality)
// ==============================================

export const authHelpers = {
  async signUp(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    university: string;
    graduation_year?: number;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async getCurrentProfile() {
    const { user, error: userError } = await this.getCurrentUser();
    if (userError || !user) return { profile: null, error: userError };

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { profile, error };
  },

  async updateProfile(updates: Partial<Omit<StudentProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>) {
    const { user, error: userError } = await this.getCurrentUser();
    if (userError || !user) return { error: userError };

    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  }
};

// ==============================================
// WAITLIST HELPERS (Landing Page)
// ==============================================

export const waitlistHelpers = {
  async addToWaitlist(email: string, university?: string, referralSource?: string) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .insert({
        email,
        university,
        referral_source: referralSource
      })
      .select()
      .single();

    return { data, error };
  },

  async getWaitlistStatus(email: string) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  }
};

// ==============================================
// FEATURE 1: BROWSE RESTAURANTS & MENUS
// ==============================================

export const restaurantHelpers = {
  async getAllRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_accepting_orders', true)
      .order('rating', { ascending: false });

    return { data, error };
  },

  async getRestaurant(restaurantId: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    return { data, error };
  },

  async getRestaurantMenu(restaurantId: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('category', { ascending: true });

    return { data, error };
  },

  async searchRestaurants(query: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,cuisine_type.ilike.%${query}%`)
      .eq('is_accepting_orders', true)
      .order('rating', { ascending: false });

    return { data, error };
  }
};

// ==============================================
// FEATURE 2: PLACE INDIVIDUAL ORDERS
// ==============================================

export const orderHelpers = {
  async createOrder(orderData: {
    restaurant_id: string;
    delivery_address: string;
    delivery_instructions?: string;
    items: {
      menu_item_id: string;
      quantity: number;
      special_instructions?: string;
    }[];
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('price')
        .eq('id', item.menu_item_id)
        .single();

      if (menuItem) {
        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;
        orderItems.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: menuItem.price,
          total_price: itemTotal,
          special_instructions: item.special_instructions
        });
      }
    }

    // Get restaurant delivery fee
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('delivery_fee')
      .eq('id', orderData.restaurant_id)
      .single();

    const deliveryFee = restaurant?.delivery_fee || 2.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        restaurant_id: orderData.restaurant_id,
        delivery_address: orderData.delivery_address,
        delivery_instructions: orderData.delivery_instructions,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        status: 'pending',
        estimated_delivery_time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      })
      .select()
      .single();

    if (orderError || !order) return { error: orderError };

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();

    if (itemsError) return { error: itemsError };

    return { data: { ...order, items }, error: null };
  },

  async getUserOrders(limit: number = 20) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants (*),
        items:order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants (*),
        items:order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('id', orderId)
      .single();

    return { data, error };
  }
};

// ==============================================
// FEATURE 3: GROUP ORDERING
// ==============================================

export const groupOrderHelpers = {
  async createGroupOrder(orderData: any, groupData: {
    group_name: string;
    max_participants?: number;
    expires_at?: string;
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    // Create the main order first
    const { data: order, error: orderError } = await orderHelpers.createOrder(orderData);
    if (orderError || !order) return { error: orderError };

    // Generate join code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create group order
    const { data: groupOrder, error: groupError } = await supabase
      .from('group_orders')
      .insert({
        order_id: order.id,
        group_name: groupData.group_name,
        organizer_user_id: user.id,
        max_participants: groupData.max_participants || 10,
        join_code: joinCode,
        expires_at: groupData.expires_at
      })
      .select()
      .single();

    if (groupError) return { error: groupError };

    // Add organizer as participant
    await supabase
      .from('group_order_participants')
      .insert({
        group_order_id: groupOrder.id,
        user_id: user.id,
        contribution_amount: order.total,
        payment_status: 'paid'
      });

    return { data: { ...groupOrder, order }, error: null };
  },

  async joinGroupOrder(joinCode: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data: groupOrder, error } = await supabase
      .from('group_orders')
      .select('*')
      .eq('join_code', joinCode)
      .eq('status', 'open')
      .single();

    if (error || !groupOrder) return { error: new Error('Group order not found') };

    // Check if already a participant
    const { data: existingParticipant } = await supabase
      .from('group_order_participants')
      .select('id')
      .eq('group_order_id', groupOrder.id)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      return { error: new Error('Already a participant in this group order') };
    }

    // Add as participant
    const { data: participant, error: participantError } = await supabase
      .from('group_order_participants')
      .insert({
        group_order_id: groupOrder.id,
        user_id: user.id,
        payment_status: 'pending'
      })
      .select()
      .single();

    return { data: participant, error: participantError };
  },

  async getGroupOrder(joinCode: string) {
    const { data, error } = await supabase
      .from('group_orders')
      .select(`
        *,
        order:orders (*),
        participants:group_order_participants (
          *,
          user_profile:student_profiles (*)
        )
      `)
      .eq('join_code', joinCode)
      .single();

    return { data, error };
  }
};

// ==============================================
// FEATURE 4: ORDER TRACKING
// ==============================================

export const trackingHelpers = {
  async getOrderUpdates(orderId: string) {
    const { data, error } = await supabase
      .from('order_status_updates')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  async addOrderUpdate(orderId: string, status: string, message?: string, estimatedTime?: string) {
    const { data, error } = await supabase
      .from('order_status_updates')
      .insert({
        order_id: orderId,
        status,
        message,
        estimated_time: estimatedTime
      })
      .select()
      .single();

    // Also update the main order status
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    return { data, error };
  }
};

// ==============================================
// FEATURE 5: RATE & REVIEW
// ==============================================

export const reviewHelpers = {
  async createReview(reviewData: {
    restaurant_id: string;
    order_id?: string;
    rating: number;
    comment?: string;
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        ...reviewData
      })
      .select()
      .single();

    return { data, error };
  },

  async getRestaurantReviews(restaurantId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user_profile:student_profiles (first_name, last_name, university)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getUserReviews() {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        restaurant:restaurants (name, image_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// ==============================================
// DASHBOARD HELPERS
// ==============================================

export const dashboardHelpers = {
  async getUserDashboard() {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    // TODO: Orders table not yet implemented
    // Returning mock data for now
    return {
      data: {
        recent_orders: [],
        total_orders: 0,
        total_spent: 0
      },
      error: null
    };
  }
};

// ==============================================
// SMART KITCHEN HELPERS
// ==============================================

export const smartKitchenHelpers = {
  async createMealPlan(name: string, inputItems: any, suggestions: any) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('ai_meal_plans')
      .insert({ user_id: user.id, name, input_items: inputItems, suggestions })
      .select()
      .single();

    return { data, error };
  },

  async getMealPlans(limit = 20) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('ai_meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async addExpirationItem(item: { item_name: string; quantity?: number; expires_at?: string; notes?: string }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('expiration_items')
      .insert({ user_id: user.id, ...item })
      .select()
      .single();

    return { data, error };
  },

  async getExpirationItems() {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('expiration_items')
      .select('*')
      .eq('user_id', user.id)
      .order('expires_at', { ascending: true });

    return { data, error };
  },

  async addSustainabilityInsight(metric: any, source?: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('sustainability_insights')
      .insert({ user_id: user.id, metric, source })
      .select()
      .single();

    return { data, error };
  },

  async logWaste(items: Record<string, number>, estimatedCost: number) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('waste_logs')
      .insert({ user_id: user.id, items, estimated_cost: estimatedCost })
      .select()
      .single();

    return { data, error };
  },

  async getWasteLogs(limit = 20) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }
};

// ==============================================
// REMINDER HELPERS
// ==============================================

export const reminderHelpers = {
  async createReminder(reminderData: {
    title: string;
    description?: string;
    reminder_type: 'meal' | 'share' | 'recipe';
    scheduled_for: string;
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        ...reminderData,
        is_completed: false
      })
      .select()
      .single();

    return { data, error };
  },

  async getReminders() {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true });

    return { data, error };
  },

  async updateReminder(reminderId: string, updates: any) {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single();

    return { data, error };
  },

  async deleteReminder(reminderId: string) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    return { error };
  }
};

// ==============================================
// FRIDGE ITEM HELPERS (Food Expiration Tracking)
// ==============================================

export const fridgeItemHelpers = {
  async createFridgeItem(itemData: {
    item_name: string;
    category?: 'dairy' | 'meat' | 'produce' | 'leftovers' | 'beverages' | 'other';
    quantity?: string;
    purchase_date?: string;
    expiration_date: string;
    notes?: string;
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('fridge_items')
      .insert({
        user_id: user.id,
        ...itemData,
        is_expired: false
      })
      .select()
      .single();

    return { data, error };
  },

  async getFridgeItems(userId?: string) {
    console.log('📦 getFridgeItems START, userId:', userId);
    
    // If no userId provided, try to get current user (may hang in browser)
    if (!userId) {
      const { user } = await authHelpers.getCurrentUser();
      if (!user) return { error: new Error('User not authenticated') };
      userId = user.id;
    }

    // WORKAROUND: Direct fetch to bypass hanging Supabase client issue in browser
    try {
      console.log('📦 Fetching fridge items for user:', userId);
      const response = await fetch(
        `${supabaseUrl}/rest/v1/fridge_items?user_id=eq.${userId}&order=expiration_date.asc&select=*`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          }
        }
      );
      
      console.log('📦 Response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: new Error(`HTTP ${response.status}: ${errorText}`) };
      }
      
      const data = await response.json();
      console.log('📦 Got items:', data?.length || 0);
      return { data, error: null };
    } catch (err) {
      console.error('📦 Error:', err);
      return { data: null, error: err as any };
    }
  },

  async getExpiringSoon(daysAhead: number = 3) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_expired', false)
      .lte('expiration_date', futureDate.toISOString())
      .order('expiration_date', { ascending: true });

    return { data, error };
  },

  async updateFridgeItem(itemId: string, updates: any) {
    const { data, error } = await supabase
      .from('fridge_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    return { data, error };
  },

  async markAsExpired(itemId: string) {
    return this.updateFridgeItem(itemId, { is_expired: true });
  },

  async deleteFridgeItem(itemId: string) {
    const { error } = await supabase
      .from('fridge_items')
      .delete()
      .eq('id', itemId);

    return { error };
  }
};

// ==============================================
// COMMUNITY POST HELPERS
// ==============================================

export const communityHelpers = {
  /**
   * Fetch all community posts with user information and engagement status
   */
  async getAllPosts(userId?: string) {
    try {
      // WORKAROUND: Direct fetch to bypass hanging Supabase client issue in browser
      const response = await fetch(`${supabaseUrl}/rest/v1/community_posts?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: new Error(`HTTP ${response.status}: ${errorText}`) };
      }
      
      const posts = await response.json();
      
      if (!posts || posts.length === 0) {
        return { data: [], error: null };
      }
      
      if (posts.error) {
        return { data: null, error: posts.error };
      }
      
      // Get user profiles separately to avoid FK constraint issues
      const userIds = [...new Set(posts.map(p => p.user_id))];
      
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select('id, first_name, last_name, university')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // If user is logged in, check which posts they've liked/saved
      if (userId) {
        const { data: likes } = await supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', userId);
        
        const { data: saves } = await supabase
          .from('community_post_saves')
          .select('post_id')
          .eq('user_id', userId);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        const savedPostIds = new Set(saves?.map(s => s.post_id) || []);

        return {
          data: posts.map(post => {
            const profile = profileMap.get(post.user_id);
            return {
              ...post,
              user_name: profile?.first_name 
                ? `${profile.first_name} ${profile.last_name?.charAt(0)}.`
                : 'Anonymous',
              user_university: profile?.university,
              is_liked_by_user: likedPostIds.has(post.id),
              is_saved_by_user: savedPostIds.has(post.id),
            };
          }),
          error: null
        };
      }

      return {
        data: posts.map(post => {
          const profile = profileMap.get(post.user_id);
          return {
            ...post,
            user_name: profile?.first_name 
              ? `${profile.first_name} ${profile.last_name?.charAt(0)}.`
              : 'Anonymous',
            user_university: profile?.university,
            is_liked_by_user: false,
            is_saved_by_user: false,
          };
        }),
        error: null
      };
    } catch (err) {
      return { data: null, error: err as any };
    }
  },

  /**
   * Create a new community post
   */
  async createPost(postData: {
    title: string;
    description?: string;
    ingredients: string[];
    prep_time?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    image_url?: string;
  }, userId?: string, accessToken?: string) {
    console.log('🔍 createPost called with userId:', userId);
    
    if (!accessToken) {
      return { data: null, error: new Error('Must be logged in to create post - no access token') };
    }

    try {
      console.log('📡 Creating post via fetch API with token...');
      const response = await fetch(
        `${supabaseUrl}/rest/v1/community_posts`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            ...postData,
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create post failed:', response.status, errorText);
        return { data: null, error: new Error(`Failed to create post: ${response.status}`) };
      }

      const data = await response.json();
      console.log('✅ Post created successfully:', data);
      return { data: Array.isArray(data) ? data[0] : data, error: null };
    } catch (err) {
      console.error('❌ Create post error:', err);
      return { data: null, error: err as any };
    }
  },

  /**
   * Like a post
   */
  async likePost(postId: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { data: null, error: new Error('Must be logged in to like') };

    const { data, error } = await supabase
      .from('community_post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('Must be logged in to unlike') };

    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    return { error };
  },

  /**
   * Save a post
   */
  async savePost(postId: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { data: null, error: new Error('Must be logged in to save') };

    const { data, error } = await supabase
      .from('community_post_saves')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Unsave a post
   */
  async unsavePost(postId: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('Must be logged in to unsave') };

    const { error } = await supabase
      .from('community_post_saves')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    return { error };
  },

  /**
   * Get user's saved posts
   */
  async getSavedPosts() {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { data: null, error: new Error('Must be logged in') };

    const { data, error } = await supabase
      .from('community_post_saves')
      .select(`
        post_id,
        community_posts (
          *,
          student_profiles!community_posts_user_id_fkey (
            first_name,
            last_name,
            university
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Delete a post (only post owner can delete)
   */
  async deletePost(postId: string) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('Must be logged in') };

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    return { error };
  }
};






