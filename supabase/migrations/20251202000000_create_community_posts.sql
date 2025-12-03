/*
  # Community Posts Feature
  
  Creates table for users to share meal recommendations with the community.
  Includes likes functionality and user attribution.
*/

-- ==============================================
-- COMMUNITY POSTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Post content
  title text NOT NULL,
  description text,
  ingredients text[] DEFAULT '{}',
  prep_time text, -- e.g., "15 mins"
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  image_url text,
  
  -- Engagement metrics
  likes_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==============================================
-- POST LIKES TABLE (for tracking who liked what)
-- ==============================================

CREATE TABLE IF NOT EXISTS community_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure a user can only like a post once
  UNIQUE(post_id, user_id)
);

-- ==============================================
-- POST SAVES TABLE (for tracking who saved what)
-- ==============================================

CREATE TABLE IF NOT EXISTS community_post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure a user can only save a post once
  UNIQUE(post_id, user_id)
);

-- ==============================================
-- INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_saves_post_id ON community_post_saves(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_saves_user_id ON community_post_saves(user_id);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_saves ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create their own posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view likes
CREATE POLICY "Anyone can view post likes"
  ON community_post_likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
  ON community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view saves
CREATE POLICY "Anyone can view post saves"
  ON community_post_saves FOR SELECT
  USING (true);

-- Users can save posts
CREATE POLICY "Users can save posts"
  ON community_post_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave posts
CREATE POLICY "Users can unsave posts"
  ON community_post_saves FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to update likes_count when a like is added/removed
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update saves_count when a save is added/removed
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET saves_count = saves_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET saves_count = saves_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER on_post_save_change
  AFTER INSERT OR DELETE ON community_post_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_post_saves_count();
