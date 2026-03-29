/*
  # VIBE Platform Database Schema

  ## Overview
  Complete database schema for VIBE social platform with anonymous-first, content-driven interactions.

  ## New Tables
  
  ### 1. `users`
  User profiles with generated anonymous identity
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Generated random username (non-editable)
  - `avatar_symbol` (text) - Random emoji/symbol for avatar
  - `avatar_gradient` (text) - Color gradient for avatar background
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. `drops`
  User posts (main content type)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Creator of the drop
  - `content` (text) - Post text content
  - `image_url` (text) - Optional image URL from storage
  - `mood` (text) - Mood tag for the drop
  - `category` (text) - stream | pulse | spaces
  - `is_ghost` (boolean) - Ghost mode (anonymous posting)
  - `expires_at` (timestamptz) - Auto-deletion timestamp
  - `seen_count` (integer) - View counter
  - `created_at` (timestamptz)
  
  ### 3. `echoes`
  Comments on drops
  - `id` (uuid, primary key)
  - `drop_id` (uuid, foreign key) - Parent drop
  - `user_id` (uuid, foreign key) - Comment author
  - `content` (text) - Comment text
  - `created_at` (timestamptz)
  
  ### 4. `feels`
  Likes/reactions on drops
  - `id` (uuid, primary key)
  - `drop_id` (uuid, foreign key) - Target drop
  - `user_id` (uuid, foreign key) - User who felt
  - `created_at` (timestamptz)
  - UNIQUE constraint on (drop_id, user_id)
  
  ### 5. `vibes`
  Follow relationships between users
  - `id` (uuid, primary key)
  - `follower_id` (uuid, foreign key) - User doing the following
  - `following_id` (uuid, foreign key) - User being followed
  - `created_at` (timestamptz)
  - UNIQUE constraint on (follower_id, following_id)
  
  ### 6. `pulses`
  Poll posts
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Poll creator
  - `question` (text) - Poll question
  - `options` (jsonb) - Array of poll options with images
  - `mood` (text) - Mood tag
  - `expires_at` (timestamptz) - Poll expiration
  - `created_at` (timestamptz)
  
  ### 7. `pulse_votes`
  Votes on polls
  - `id` (uuid, primary key)
  - `pulse_id` (uuid, foreign key) - Target poll
  - `user_id` (uuid, foreign key) - Voter
  - `option_index` (integer) - Selected option index
  - `created_at` (timestamptz)
  - UNIQUE constraint on (pulse_id, user_id) - One vote per user
  
  ### 8. `spaces`
  Temporary chat rooms
  - `id` (uuid, primary key)
  - `creator_id` (uuid, foreign key) - Room creator
  - `name` (text) - Space name
  - `description` (text) - Space description
  - `expires_at` (timestamptz) - Auto-deletion timestamp
  - `created_at` (timestamptz)
  
  ### 9. `space_messages`
  Messages within spaces
  - `id` (uuid, primary key)
  - `space_id` (uuid, foreign key) - Parent space
  - `user_id` (uuid, foreign key) - Message author
  - `content` (text) - Message content
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their own content
  - Public read access for non-sensitive data
  - Proper foreign key constraints with cascading deletes
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_symbol text NOT NULL DEFAULT '🌀',
  avatar_gradient text NOT NULL DEFAULT 'from-purple-500 to-pink-500',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create drops table
CREATE TABLE IF NOT EXISTS drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text,
  image_url text,
  mood text,
  category text NOT NULL DEFAULT 'stream',
  is_ghost boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  seen_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-expired drops"
  ON drops FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can insert own drops"
  ON drops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drops"
  ON drops FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drops"
  ON drops FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_drops_created_at ON drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_user_id ON drops(user_id);
CREATE INDEX IF NOT EXISTS idx_drops_expires_at ON drops(expires_at);

-- Create echoes table
CREATE TABLE IF NOT EXISTS echoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE echoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view echoes"
  ON echoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own echoes"
  ON echoes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own echoes"
  ON echoes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_echoes_drop_id ON echoes(drop_id);
CREATE INDEX IF NOT EXISTS idx_echoes_created_at ON echoes(created_at DESC);

-- Create feels table
CREATE TABLE IF NOT EXISTS feels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(drop_id, user_id)
);

ALTER TABLE feels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feels"
  ON feels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own feels"
  ON feels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feels"
  ON feels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feels_drop_id ON feels(drop_id);
CREATE INDEX IF NOT EXISTS idx_feels_user_id ON feels(user_id);

-- Create vibes table
CREATE TABLE IF NOT EXISTS vibes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vibes"
  ON vibes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own vibes"
  ON vibes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own vibes"
  ON vibes FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_vibes_follower_id ON vibes(follower_id);
CREATE INDEX IF NOT EXISTS idx_vibes_following_id ON vibes(following_id);

-- Create pulses table
CREATE TABLE IF NOT EXISTS pulses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  mood text,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-expired pulses"
  ON pulses FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can insert own pulses"
  ON pulses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pulses"
  ON pulses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pulses_created_at ON pulses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulses_expires_at ON pulses(expires_at);

-- Create pulse_votes table
CREATE TABLE IF NOT EXISTS pulse_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pulse_id uuid NOT NULL REFERENCES pulses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pulse_id, user_id)
);

ALTER TABLE pulse_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pulse votes"
  ON pulse_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON pulse_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON pulse_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON pulse_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pulse_votes_pulse_id ON pulse_votes(pulse_id);

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-expired spaces"
  ON spaces FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can insert own spaces"
  ON spaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own spaces"
  ON spaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own spaces"
  ON spaces FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE INDEX IF NOT EXISTS idx_spaces_created_at ON spaces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spaces_expires_at ON spaces(expires_at);

-- Create space_messages table
CREATE TABLE IF NOT EXISTS space_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE space_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages in non-expired spaces"
  ON space_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_messages.space_id
      AND spaces.expires_at > now()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON space_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON space_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_space_messages_space_id ON space_messages(space_id);
CREATE INDEX IF NOT EXISTS idx_space_messages_created_at ON space_messages(created_at DESC);