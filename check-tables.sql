-- First, let's check if the tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'community%'
ORDER BY table_name;

-- If you see the tables listed above, run this to reload the schema cache:
NOTIFY pgrst, 'reload schema';
