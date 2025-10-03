// ==============================================
// DORMPLATE MVP TYPES - Focused on 5 Core Features
// ==============================================

// Base interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// ==============================================
// WAITLIST (Landing Page)
// ==============================================

export interface WaitlistEntry extends BaseEntity {
  email: string;
  university?: string;
  referral_source?: string;
  status: 'pending' | 'invited' | 'registered';
  invited_at?: string;
  registered_at?: string;
}

// ==============================================
// FEATURE 1: BROWSE RESTAURANTS & MENUS
// ==============================================

export interface Restaurant extends BaseEntity {
  name: string;
  description?: string;
  cuisine_type: string;
  image_url?: string;
  rating: number;
  review_count: number;
  estimated_delivery_time_minutes: number;
  delivery_fee: number;
  min_order_amount: number;
  is_accepting_orders: boolean;
}

export interface MenuItem extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: 'appetizers' | 'mains' | 'desserts' | 'drinks';
  is_available: boolean;
}

// ==============================================
// FEATURE 2: PLACE INDIVIDUAL ORDERS
// ==============================================

export interface Order extends BaseEntity {
  order_number: string;
  user_id: string;
  restaurant_id?: string;
  delivery_address: string;
  delivery_instructions?: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimated_delivery_time?: string;
  
  // Relations (populated when needed)
  restaurant?: Restaurant;
  items?: OrderItem[];
}

export interface OrderItem extends BaseEntity {
  order_id: string;
  menu_item_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  
  // Relations
  menu_item?: MenuItem;
}

// ==============================================
// FEATURE 3: GROUP ORDERING
// ==============================================

export interface GroupOrder extends BaseEntity {
  order_id: string;
  group_name: string;
  organizer_user_id: string;
  join_code: string;
  max_participants: number;
  status: 'open' | 'closed' | 'completed';
  expires_at?: string;
  
  // Relations
  order?: Order;
  participants?: GroupOrderParticipant[];
}

export interface GroupOrderParticipant extends BaseEntity {
  group_order_id: string;
  user_id: string;
  contribution_amount: number;
  payment_status: 'pending' | 'paid';
  joined_at: string;
  
  // Relations
  user_profile?: StudentProfile;
}

// ==============================================
// FEATURE 4: ORDER TRACKING
// ==============================================

export interface OrderStatusUpdate extends BaseEntity {
  order_id: string;
  status: string;
  message?: string;
  estimated_time?: string;
}

// ==============================================
// FEATURE 5: RATE & REVIEW
// ==============================================

export interface Review extends BaseEntity {
  user_id: string;
  restaurant_id: string;
  order_id?: string;
  rating: number; // 1-5 stars
  comment?: string;
  
  // Relations
  user_profile?: StudentProfile;
}

// ==============================================
// USER PROFILE (Enhanced from existing)
// ==============================================

export interface StudentProfile extends BaseEntity {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  university: string;
  graduation_year?: number;
  dorm_building?: string;
  room_number?: string;
  phone?: string;
  dietary_preferences?: string[];
}

// ==============================================
// FORM TYPES
// ==============================================

export interface WaitlistFormData {
  email: string;
  university?: string;
  referralSource?: string;
}

export interface OrderFormData {
  restaurant_id: string;
  delivery_address: string;
  delivery_instructions?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
}

export interface GroupOrderFormData {
  group_name: string;
  max_participants?: number;
  expires_at?: string;
  order_data: OrderFormData;
}

export interface ReviewFormData {
  restaurant_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ==============================================
// DASHBOARD & ANALYTICS
// ==============================================

export interface UserDashboard {
  recent_orders: Order[];
  favorite_restaurants: Restaurant[];
  total_orders: number;
  total_spent: number;
}

export interface RestaurantWithMenu extends Restaurant {
  menu_items: MenuItem[];
}

// ==============================================
// FILTER TYPES
// ==============================================

export interface RestaurantFilters {
  cuisine_types?: string[];
  max_delivery_time?: number;
  min_rating?: number;
  max_delivery_fee?: number;
}

export interface OrderFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  restaurant_id?: string;
}




