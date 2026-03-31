-- VIBE Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '{"initial":"?","symbol":"◆","gradient":"from-gray-500 to-gray-600"}',
  premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_post_date TIMESTAMP WITH TIME ZONE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drops (posts) table
CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'angry', 'excited', 'chill', 'anxious', 'loved', 'bored', 'confused', 'grateful')),
  category TEXT NOT NULL DEFAULT 'stream' CHECK (category IN ('stream', 'pulse', 'spaces')),
  expires_at TIMESTAMP WITH TIME ZONE,
  ghost_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Echoes (comments) table
CREATE TABLE echoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post engagement table (counters)
CREATE TABLE post_engagement (
  post_id UUID PRIMARY KEY REFERENCES drops(id) ON DELETE CASCADE,
  feel_count INTEGER DEFAULT 0,
  echo_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table (likes, views, shares, votes)
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'view', 'share', 'vote', 'post')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, type)
);

-- Pulse options table (for polls)
CREATE TABLE pulse_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  image_url TEXT,
  vote_count INTEGER DEFAULT 0
);

-- Pulse votes table
CREATE TABLE pulse_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES pulse_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, option_id)
);

-- Spaces (chat rooms) table
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space messages table
CREATE TABLE space_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply_to UUID REFERENCES space_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space members table (for tracking active users)
CREATE TABLE space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Vibe relationships (follows) table
CREATE TABLE vibe_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', '6months', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paystack_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  requirement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  liked_topics TEXT[] DEFAULT '{}',
  interaction_score JSONB DEFAULT '{}',
  preferred_moods TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feel', 'echo', 'vibe', 'mention', 'pulse')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_drops_user_id ON drops(user_id);
CREATE INDEX idx_drops_created_at ON drops(created_at DESC);
CREATE INDEX idx_drops_category ON drops(category);
CREATE INDEX idx_drops_expires_at ON drops(expires_at);
CREATE INDEX idx_echoes_post_id ON echoes(post_id);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_post_id ON user_interactions(post_id);
CREATE INDEX idx_vibe_relationships_follower ON vibe_relationships(follower_id);
CREATE INDEX idx_vibe_relationships_following ON vibe_relationships(following_id);
CREATE INDEX idx_space_messages_space_id ON space_messages(space_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create functions for engagement counters
CREATE OR REPLACE FUNCTION increment_feel_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO post_engagement (post_id, feel_count)
  VALUES (p_post_id, 1)
  ON CONFLICT (post_id)
  DO UPDATE SET feel_count = post_engagement.feel_count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_feel_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE post_engagement
  SET feel_count = GREATEST(0, feel_count - 1), updated_at = NOW()
  WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_echo_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO post_engagement (post_id, echo_count)
  VALUES (p_post_id, 1)
  ON CONFLICT (post_id)
  DO UPDATE SET echo_count = post_engagement.echo_count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_pulse_vote(p_option_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pulse_options
  SET vote_count = vote_count + 1
  WHERE id = p_option_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_pulse_vote(p_option_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pulse_options
  SET vote_count = GREATEST(0, vote_count - 1)
  WHERE id = p_option_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for feed algorithm
CREATE OR REPLACE FUNCTION get_feed_drops(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS SETOF drops AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM drops d
  LEFT JOIN post_engagement e ON d.id = e.post_id
  LEFT JOIN vibe_relationships v ON v.following_id = d.user_id AND v.follower_id = p_user_id
  WHERE d.expires_at IS NULL OR d.expires_at > NOW()
  ORDER BY 
    CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END DESC,
    COALESCE(e.feel_count, 0) * 0.3 + 
    COALESCE(e.echo_count, 0) * 0.2 + 
    COALESCE(e.share_count, 0) * 0.2 +
    EXTRACT(EPOCH FROM (NOW() - d.created_at)) / 3600 * -0.1 DESC,
    d.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE echoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users: Everyone can read, only self can update
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Drops: Everyone can read, only creator can delete
CREATE POLICY "Drops are viewable by everyone" ON drops
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create drops" ON drops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drops" ON drops
  FOR DELETE USING (auth.uid() = user_id);

-- Echoes: Everyone can read, only creator can delete
CREATE POLICY "Echoes are viewable by everyone" ON echoes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create echoes" ON echoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own echoes" ON echoes
  FOR DELETE USING (auth.uid() = user_id);

-- User interactions: Everyone can read, only self can create/delete
CREATE POLICY "Interactions are viewable by everyone" ON user_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create own interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON user_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Spaces: Everyone can read public spaces, members can read private
CREATE POLICY "Spaces are viewable by everyone" ON spaces
  FOR SELECT USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Space messages: Members can read/write
CREATE POLICY "Space messages viewable by space members" ON space_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaces s
      WHERE s.id = space_id AND (NOT s.is_private OR s.created_by = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can send messages" ON space_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vibe relationships: Everyone can read, only self can create/delete
CREATE POLICY "Vibe relationships are viewable by everyone" ON vibe_relationships
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own vibe relationships" ON vibe_relationships
  FOR ALL USING (auth.uid() = follower_id);

-- Enable Realtime for relevant tables
BEGIN;
  -- Drop existing publication if exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication
  CREATE PUBLICATION supabase_realtime;
  
  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE space_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE drops;
  ALTER PUBLICATION supabase_realtime ADD TABLE echoes;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_interactions;
COMMIT;

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement) VALUES
  ('Early Bird', 'Joined VIBE in the first month', '🐦', 'early_adopter'),
  ('Drop Master', 'Created 50+ drops', '💧', 'drops_50'),
  ('Vibe Collector', 'Gained 100+ vibers', '🌟', 'vibers_100'),
  ('Echo Champion', 'Received 500+ echoes', '📢', 'echoes_500'),
  ('Feel Magnet', 'Received 1000+ feels', '❤️', 'feels_1000'),
  ('Streak Keeper', 'Maintained a 30-day streak', '🔥', 'streak_30'),
  ('Level 10', 'Reached level 10', '🏆', 'level_10'),
  ('Premium Member', 'Upgraded to premium', '👑', 'premium');

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vibe-uploads', 'vibe-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'vibe-uploads');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vibe-uploads' 
    AND auth.role() = 'authenticated'
  );
