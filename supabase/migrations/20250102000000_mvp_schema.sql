/*
  # DormPlate MVP Schema
  
  Core features:
  1. Browse Restaurants & Menus
  2. Place Individual Orders  
  3. Group Ordering
  4. Order Tracking
  5. Rate & Review
  
  Plus: Waitlist collection for landing page
*/

-- ==============================================
-- 1. WAITLIST (for landing page)
-- ==============================================

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  university text,
  referral_source text,
  status text DEFAULT 'pending', -- 'pending', 'invited', 'registered'
  invited_at timestamptz,
  registered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ==============================================
-- 2. RESTAURANTS & MENUS (Feature 1: Browse)
-- ==============================================

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cuisine_type text NOT NULL,
  image_url text,
  rating decimal(3,2) DEFAULT 0.00,
  review_count integer DEFAULT 0,
  estimated_delivery_time_minutes integer DEFAULT 30,
  delivery_fee decimal(10,2) DEFAULT 2.99,
  min_order_amount decimal(10,2) DEFAULT 10.00,
  is_accepting_orders boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text, -- 'appetizers', 'mains', 'desserts', 'drinks'
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ==============================================
-- 3. ORDERS (Feature 2: Individual Orders)
-- ==============================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id),
  
  -- Delivery details
  delivery_address text NOT NULL,
  delivery_instructions text,
  
  -- Pricing
  subtotal decimal(10,2) NOT NULL,
  delivery_fee decimal(10,2) DEFAULT 2.99,
  tax decimal(10,2) DEFAULT 0.00,
  total decimal(10,2) NOT NULL,
  
  -- Status & timing
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
  estimated_delivery_time timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- ==============================================
-- 4. GROUP ORDERS (Feature 3: Group Ordering)
-- ==============================================

CREATE TABLE IF NOT EXISTS group_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  group_name text NOT NULL,
  organizer_user_id uuid REFERENCES auth.users(id),
  join_code text UNIQUE NOT NULL,
  max_participants integer DEFAULT 10,
  status text NOT NULL DEFAULT 'open', -- 'open', 'closed', 'completed'
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_order_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id uuid REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_amount decimal(10,2) DEFAULT 0.00,
  payment_status text DEFAULT 'pending', -- 'pending', 'paid'
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_order_id, user_id)
);

-- ==============================================
-- 5. ORDER TRACKING (Feature 4: Order Tracking)
-- ==============================================

CREATE TABLE IF NOT EXISTS order_status_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text,
  estimated_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ==============================================
-- 6. REVIEWS (Feature 5: Rate & Review)
-- ==============================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_id)
);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Generate order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'DP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Update restaurant ratings when reviews are added
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS trigger AS $$
DECLARE
  restaurant_uuid uuid;
BEGIN
  -- Get restaurant_id from the review
  restaurant_uuid := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  
  -- Update restaurant rating and count
  UPDATE restaurants 
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE restaurant_id = restaurant_uuid),
    review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = restaurant_uuid)
  WHERE id = restaurant_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_restaurant_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

-- Update order totals when items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS trigger AS $$
DECLARE
  order_uuid uuid;
  order_subtotal decimal(10,2);
  order_delivery_fee decimal(10,2);
  order_tax decimal(10,2);
BEGIN
  order_uuid := COALESCE(NEW.order_id, OLD.order_id);
  
  -- Calculate subtotal
  SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
  FROM order_items 
  WHERE order_id = order_uuid;
  
  -- Get delivery fee from restaurant or use default
  SELECT COALESCE(r.delivery_fee, 2.99) INTO order_delivery_fee
  FROM orders o
  LEFT JOIN restaurants r ON o.restaurant_id = r.id
  WHERE o.id = order_uuid;
  
  -- Calculate tax (8%)
  order_tax := order_subtotal * 0.08;
  
  -- Update order
  UPDATE orders 
  SET 
    subtotal = order_subtotal,
    delivery_fee = order_delivery_fee,
    tax = order_tax,
    total = order_subtotal + order_delivery_fee + order_tax,
    updated_at = now()
  WHERE id = order_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_order_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for restaurants and menu items
CREATE POLICY "Public read restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public read menu items" ON menu_items FOR SELECT USING (true);

-- Users can manage their own orders
CREATE POLICY "Users manage own orders" ON orders 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own order items" ON order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Group order policies
CREATE POLICY "Users can read group orders they participate in" ON group_orders 
  FOR SELECT USING (
    auth.uid() = organizer_user_id OR 
    EXISTS (SELECT 1 FROM group_order_participants WHERE group_order_participants.group_order_id = group_orders.id AND group_order_participants.user_id = auth.uid())
  );

CREATE POLICY "Users can create group orders" ON group_orders 
  FOR INSERT WITH CHECK (auth.uid() = organizer_user_id);

CREATE POLICY "Users manage own group participation" ON group_order_participants 
  FOR ALL USING (auth.uid() = user_id);

-- Order tracking - users can see updates for their orders
CREATE POLICY "Users see own order updates" ON order_status_updates 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_updates.order_id AND orders.user_id = auth.uid())
  );

-- Reviews - users can manage their own reviews, read all reviews
CREATE POLICY "Users manage own reviews" ON reviews 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_group_orders_join_code ON group_orders(join_code);
CREATE INDEX idx_waitlist_email ON waitlist_entries(email);

-- ==============================================
-- SAMPLE DATA (for development)
-- ==============================================

-- Sample restaurants
INSERT INTO restaurants (name, description, cuisine_type, image_url, estimated_delivery_time_minutes, delivery_fee, min_order_amount) VALUES
('Campus Burgers', 'Fresh burgers made with local ingredients', 'American', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 25, 2.99, 12.00),
('Panda Express', 'Fresh Chinese food served fast', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 20, 1.99, 8.00),
('Pizza Corner', 'Wood-fired pizzas and Italian favorites', 'Italian', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 30, 3.99, 15.00),
('Healthy Bowls', 'Fresh salads, grain bowls, and smoothies', 'Healthy', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 15, 2.49, 10.00);

-- Sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) 
SELECT 
  r.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.image_url
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('Classic Cheeseburger', 'Beef patty with cheese, lettuce, tomato', 12.99, 'mains', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'),
    ('Chicken Sandwich', 'Grilled chicken breast with avocado', 11.99, 'mains', 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=300'),
    ('Sweet Potato Fries', 'Crispy sweet potato fries with aioli', 6.99, 'appetizers', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300'),
    ('Chocolate Shake', 'Rich chocolate milkshake', 4.99, 'drinks', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300')
) AS item(name, description, price, category, image_url)
WHERE r.name = 'Campus Burgers';

INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) 
SELECT 
  r.id,
  item.name,
  item.description,
  item.price,
  item.category,
  item.image_url
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('Orange Chicken', 'Sweet and tangy orange chicken', 9.99, 'mains', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300'),
    ('Beef Broccoli', 'Tender beef with fresh broccoli', 10.99, 'mains', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300'),
    ('Fried Rice', 'Wok-fried rice with vegetables', 7.99, 'mains', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300'),
    ('Spring Rolls', 'Crispy vegetable spring rolls', 5.99, 'appetizers', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300')
) AS item(name, description, price, category, image_url)
WHERE r.name = 'Panda Express';




