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
    const { error } = await supabase.auth.signOut();
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

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants (name, image_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get order stats
    const { data: orderStats } = await supabase
      .from('orders')
      .select('total')
      .eq('user_id', user.id)
      .eq('status', 'delivered');

    const totalOrders = orderStats?.length || 0;
    const totalSpent = orderStats?.reduce((sum, order) => sum + order.total, 0) || 0;

    return {
      data: {
        recent_orders: recentOrders || [],
        total_orders: totalOrders,
        total_spent: totalSpent
      },
      error: null
    };
  }
};




