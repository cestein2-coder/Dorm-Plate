-- Add 'meals' category to fridge_items table
-- Drop the existing category constraint
ALTER TABLE public.fridge_items 
  DROP CONSTRAINT IF EXISTS fridge_items_category_check;

-- Add new constraint that includes 'meals'
ALTER TABLE public.fridge_items 
  ADD CONSTRAINT fridge_items_category_check 
  CHECK (category IN ('dairy', 'meat', 'produce', 'leftovers', 'beverages', 'meals', 'other'));
