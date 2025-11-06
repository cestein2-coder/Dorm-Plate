-- Create fridge_items table for tracking food expiration
CREATE TABLE IF NOT EXISTS public.fridge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text CHECK (category IN ('dairy', 'meat', 'produce', 'leftovers', 'beverages', 'other')),
  quantity text,
  purchase_date timestamptz DEFAULT now(),
  expiration_date timestamptz NOT NULL,
  is_expired boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_fridge_items_user_id ON public.fridge_items(user_id);
CREATE INDEX idx_fridge_items_expiration_date ON public.fridge_items(expiration_date);
CREATE INDEX idx_fridge_items_category ON public.fridge_items(category);

-- Enable Row Level Security
ALTER TABLE public.fridge_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own fridge items"
  ON public.fridge_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fridge items"
  ON public.fridge_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fridge items"
  ON public.fridge_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fridge items"
  ON public.fridge_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.fridge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
