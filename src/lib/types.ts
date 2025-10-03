// ==============================================
// DORMPLATE TYPESCRIPT TYPES
// ==============================================

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// 1. CAMPUSES AND LOCATIONS
export interface Campus extends BaseEntity {
  name: string;
  city: string;
  state: string;
  country?: string;
  timezone?: string;
  delivery_fee: number;
  min_order_amount: number;
  delivery_radius_miles: number;
  is_active: boolean;
}

export interface CampusLocation extends BaseEntity {
  campus_id: string;
  name: string;
  type: 'dorm' | 'library' | 'academic_building' | 'dining_hall' | 'other';
  building_code?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  delivery_instructions?: string;
  is_active: boolean;
}

// 2. RESTAURANTS
export interface Restaurant extends BaseEntity {
  name: string;
  description?: string;
  cuisine_type: string;
  phone?: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  logo_url?: string;
  rating: number;
  review_count: number;
  estimated_prep_time_minutes: number;
  delivery_fee: number;
  min_order_amount: number;
  is_accepting_orders: boolean;
  is_verified: boolean;
}

export interface RestaurantCampusCoverage extends BaseEntity {
  restaurant_id: string;
  campus_id: string;
  delivery_fee_override?: number;
  min_order_override?: number;
  estimated_delivery_time_minutes?: number;
  is_active: boolean;
}

// 3. MENU ITEMS
export interface MenuCategory extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItemModifierOption {
  name: string;
  price: number;
  is_default: boolean;
}

export interface MenuItemModifier extends BaseEntity {
  menu_item_id: string;
  name: string;
  type: 'size' | 'add_on' | 'customization' | 'substitution';
  options: MenuItemModifierOption[];
  is_required: boolean;
  max_selections: number;
  display_order: number;
}

export interface MenuItem extends BaseEntity {
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  allergens?: string[];
  calories?: number;
  prep_time_minutes: number;
  is_available: boolean;
  display_order: number;
  modifiers?: MenuItemModifier[];
}

// 4. SUBSCRIPTIONS
export interface SubscriptionPlan extends BaseEntity {
  name: string;
  description?: string;
  price_monthly: number;
  features: string[];
  free_delivery_threshold?: number;
  priority_support: boolean;
  gps_tracking: boolean;
  group_ordering_limit?: number;
  early_access: boolean;
  is_active: boolean;
}

export interface UserSubscription extends BaseEntity {
  user_id: string;
  plan_id?: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
}

// 5. ORDERS
export interface Order extends BaseEntity {
  order_number: string;
  user_id: string;
  restaurant_id?: string;
  campus_id?: string;
  delivery_location_id?: string;
  delivery_address: string;
  delivery_instructions?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  
  // Order Details
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount_amount: number;
  total: number;
  
  // Timing
  estimated_prep_time_minutes?: number;
  estimated_delivery_time_minutes?: number;
  scheduled_delivery_at?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Payment
  payment_method?: 'card' | 'apple_pay' | 'google_pay';
  stripe_payment_intent_id?: string;
  
  // Relations
  restaurant?: Restaurant;
  campus?: Campus;
  delivery_location?: CampusLocation;
  items?: OrderItem[];
  delivery_tracking?: DeliveryTracking;
}

export interface OrderItemModifier {
  modifier_id: string;
  modifier_name: string;
  selected_options: {
    name: string;
    price: number;
  }[];
}

export interface OrderItem extends BaseEntity {
  order_id: string;
  menu_item_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  modifiers?: OrderItemModifier[];
  menu_item?: MenuItem;
}

// 6. GROUP ORDERS
export interface GroupOrder extends BaseEntity {
  order_id: string;
  group_name: string;
  organizer_user_id: string;
  max_participants?: number;
  join_code: string;
  status: 'open' | 'closed' | 'completed';
  expires_at?: string;
  participants?: GroupOrderParticipant[];
}

export interface GroupOrderParticipant extends BaseEntity {
  group_order_id: string;
  user_id: string;
  contribution_amount?: number;
  payment_status: 'pending' | 'paid' | 'failed';
  user_profile?: StudentProfile;
}

// 7. DELIVERY TRACKING
export interface DeliveryTracking extends BaseEntity {
  order_id: string;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle_info?: string;
  current_latitude?: number;
  current_longitude?: number;
  status: 'picked_up' | 'en_route' | 'arrived' | 'delivered';
  estimated_arrival?: string;
  actual_arrival?: string;
  delivery_photo_url?: string;
}

// 8. REVIEWS
export interface Review extends BaseEntity {
  user_id: string;
  restaurant_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  food_quality_rating?: number;
  delivery_speed_rating?: number;
  is_verified: boolean;
  user_profile?: StudentProfile;
  likes_count?: number;
  is_liked_by_user?: boolean;
}

export interface ReviewLike extends BaseEntity {
  review_id: string;
  user_id: string;
}

// 9. PROMOTIONS
export interface Promotion extends BaseEntity {
  code?: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
  campus_ids?: string[];
  restaurant_ids?: string[];
  is_active: boolean;
}

export interface UserPromotionUsage extends BaseEntity {
  user_id: string;
  promotion_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

// 10. WAITLIST
export interface WaitlistEntry extends BaseEntity {
  email: string;
  university?: string;
  referral_source?: string;
  status: 'pending' | 'invited' | 'registered' | 'expired';
  invited_at?: string;
  registered_at?: string;
}

// 11. NOTIFICATIONS
export interface Notification extends BaseEntity {
  user_id: string;
  type: 'order_update' | 'promotion' | 'group_order_invite' | 'delivery_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
}

// 12. STUDENT PROFILE (existing, but enhanced)
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
  
  // Additional fields for enhanced functionality
  campus_id?: string;
  default_delivery_location_id?: string;
  payment_methods?: PaymentMethod[];
  favorite_restaurants?: string[];
  order_history_count?: number;
  total_spent?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last_four?: string;
  brand?: string;
  is_default: boolean;
  stripe_payment_method_id: string;
}

// API Response Types
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

// Form Types
export interface OrderFormData {
  restaurant_id: string;
  delivery_location_id?: string;
  delivery_address: string;
  delivery_instructions?: string;
  scheduled_delivery_at?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    modifiers?: OrderItemModifier[];
  }[];
  promotion_code?: string;
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
  title?: string;
  comment?: string;
  food_quality_rating?: number;
  delivery_speed_rating?: number;
}

// Filter and Search Types
export interface RestaurantFilters {
  cuisine_types?: string[];
  price_range?: [number, number];
  rating_min?: number;
  delivery_time_max?: number;
  is_vegetarian_friendly?: boolean;
  is_vegan_friendly?: boolean;
  campus_id?: string;
}

export interface OrderFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  restaurant_id?: string;
}

// Analytics Types
export interface OrderAnalytics {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_restaurants: Array<{
    restaurant: Restaurant;
    order_count: number;
    total_spent: number;
  }>;
  order_trends: Array<{
    date: string;
    order_count: number;
    total_spent: number;
  }>;
}

// Dashboard Types
export interface DashboardStats {
  total_orders: number;
  total_spent: number;
  active_subscription?: UserSubscription;
  recent_orders: Order[];
  favorite_restaurants: Restaurant[];
  notifications: Notification[];
}




