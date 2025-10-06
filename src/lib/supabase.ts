import { createClient } from '@supabase/supabase-js';
import type { 
  StudentProfile, 
  Restaurant, 
  MenuItem, 
  MenuCategory,
  Order, 
  OrderItem,
  Campus,
  CampusLocation,
  Review,
  GroupOrder,
  DeliveryTracking,
  Notification,
  SubscriptionPlan,
  UserSubscription,
  WaitlistEntry,
  Promotion
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
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

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current user's profile
  async getCurrentProfile() {
    const { user, error: userError } = await this.getCurrentUser();
    if (userError || !user) return { profile: null, error: userError };

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return { profile, error };
  },

  // Update user profile
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

// Restaurant helpers
export const restaurantHelpers = {
  // Get restaurants by campus
  async getRestaurantsByCampus(campusId: string) {
    const { data, error } = await supabase
      .from('restaurant_campus_coverage')
      .select(`
        *,
        restaurants (*)
      `)
      .eq('campus_id', campusId)
      .eq('is_active', true);

    return { data, error };
  },

  // Get restaurant menu
  async getRestaurantMenu(restaurantId: string) {
    const { data, error } = await supabase
      .from('menu_categories')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('display_order');

    return { data, error };
  },

  // Get restaurant details
  async getRestaurant(restaurantId: string) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    return { data, error };
  }
};

// Order helpers
export const orderHelpers = {
  // Create new order
  async createOrder(orderData: {
    restaurant_id: string;
    campus_id: string;
    delivery_location_id?: string;
    delivery_address: string;
    delivery_instructions?: string;
    delivery_latitude?: number;
    delivery_longitude?: number;
    scheduled_delivery_at?: string;
    items: {
      menu_item_id: string;
      quantity: number;
      special_instructions?: string;
      modifiers?: any[];
    }[];
    promotion_code?: string;
  }) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      // Get menu item details
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
          special_instructions: item.special_instructions,
          modifiers: item.modifiers
        });
      }
    }

    // Apply delivery fee (simplified - you'd want to get this from restaurant/campus settings)
    const deliveryFee = 2.99;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const tax = (subtotal + serviceFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + serviceFee + tax;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        restaurant_id: orderData.restaurant_id,
        campus_id: orderData.campus_id,
        delivery_location_id: orderData.delivery_location_id,
        delivery_address: orderData.delivery_address,
        delivery_instructions: orderData.delivery_instructions,
        delivery_latitude: orderData.delivery_latitude,
        delivery_longitude: orderData.delivery_longitude,
        scheduled_delivery_at: orderData.scheduled_delivery_at,
        subtotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        tax,
        total,
        status: 'pending'
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

  // Get user orders
  async getUserOrders(userId?: string, limit: number = 20) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user && !userId) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants (*),
        campus:campuses (*),
        delivery_location:campus_locations (*),
        items:order_items (
          *,
          menu_item:menu_items (*)
        ),
        delivery_tracking (*)
      `)
      .eq('user_id', userId || user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  }
};

// Group order helpers
export const groupOrderHelpers = {
  // Create group order
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
        max_participants: groupData.max_participants,
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
        payment_status: 'paid'
      });

    return { data: { ...groupOrder, order }, error: null };
  },

  // Join group order
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
  }
};

// Review helpers
export const reviewHelpers = {
  // Create review
  async createReview(reviewData: {
    restaurant_id: string;
    order_id?: string;
    rating: number;
    title?: string;
    comment?: string;
    food_quality_rating?: number;
    delivery_speed_rating?: number;
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

  // Get restaurant reviews
  async getRestaurantReviews(restaurantId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user_profile:student_profiles (*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }
};

// Campus helpers
export const campusHelpers = {
  // Get campuses
  async getCampuses() {
    const { data, error } = await supabase
      .from('campuses')
      .select('*')
      .eq('is_active', true)
      .order('name');

    return { data, error };
  },

  // Get campus locations
  async getCampusLocations(campusId: string) {
    const { data, error } = await supabase
      .from('campus_locations')
      .select('*')
      .eq('campus_id', campusId)
      .eq('is_active', true)
      .order('name');

    return { data, error };
  }
};

// Waitlist helpers
export const waitlistHelpers = {
  // Add to waitlist
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

  // Get waitlist status
  async getWaitlistStatus(email: string) {
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  }
};

// Notification helpers
export const notificationHelpers = {
  // Get user notifications
  async getUserNotifications(limit: number = 20) {
    const { user } = await authHelpers.getCurrentUser();
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    return { data, error };
  }
};