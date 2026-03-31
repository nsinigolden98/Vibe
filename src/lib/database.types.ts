export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_symbol: string;
          avatar_gradient: string;
          xp: number;
          level: number;
          streak: number;
          last_active: string | null;
          premium: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_symbol?: string;
          avatar_gradient?: string;
          xp?: number;
          level?: number;
          streak?: number;
          last_active?: string | null;
          premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_symbol?: string;
          avatar_gradient?: string;
          xp?: number;
          level?: number;
          streak?: number;
          last_active?: string | null;
          premium?: boolean;
          created_at?: string;
        };
      };
      drops: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          image_url: string | null;
          video_url: string | null;
          mood: string | null;
          category: string;
          is_ghost: boolean;
          expires_at: string | null;
          seen_count: number;
          pinned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          mood?: string | null;
          category?: string;
          is_ghost?: boolean;
          expires_at?: string | null;
          seen_count?: number;
          pinned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          mood?: string | null;
          category?: string;
          is_ghost?: boolean;
          expires_at?: string | null;
          seen_count?: number;
          pinned?: boolean;
          created_at?: string;
        };
      };
      echoes: {
        Row: {
          id: string;
          drop_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          drop_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          drop_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      feels: {
        Row: {
          id: string;
          drop_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          drop_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          drop_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      vibes: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      pulses: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          options: Json;
          mood: string | null;
          expires_at: string | null;
          seen_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          options?: Json;
          mood?: string | null;
          expires_at?: string | null;
          seen_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question?: string;
          options?: Json;
          mood?: string | null;
          expires_at?: string | null;
          seen_count?: number;
          created_at?: string;
        };
      };
      pulse_votes: {
        Row: {
          id: string;
          pulse_id: string;
          user_id: string;
          option_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pulse_id: string;
          user_id: string;
          option_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pulse_id?: string;
          user_id?: string;
          option_index?: number;
          created_at?: string;
        };
      };
      spaces: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          expires_at: string;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string | null;
          expires_at?: string;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          description?: string | null;
          expires_at?: string;
          is_private?: boolean;
          created_at?: string;
        };
      };
      space_messages: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          type?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          liked_topics: Json;
          interaction_score: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          liked_topics?: Json;
          interaction_score?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          liked_topics?: Json;
          interaction_score?: Json;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          post_id: string;
          reporter_id: string;
          reason: string;
          post_type: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          reporter_id: string;
          reason: string;
          post_type?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          reporter_id?: string;
          reason?: string;
          post_type?: string;
          status?: string;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          description?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: {
          user_id?: string;
          badge_id?: string;
          awarded_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          plan: string;
          started_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: string;
          plan: string;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          plan?: string;
          started_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      post_engagement: {
        Row: {
          post_id: string;
          feel_count: number;
          comment_count: number;
          share_count: number;
          updated_at: string;
        };
        Insert: {
          post_id: string;
          feel_count?: number;
          comment_count?: number;
          share_count?: number;
          updated_at?: string;
        };
        Update: {
          post_id?: string;
          feel_count?: number;
          comment_count?: number;
          share_count?: number;
          updated_at?: string;
        };
      };
    };
    Functions: {
      increment_drop_views: {
        Args: { drop_id: string };
        Returns: void;
      };
    };
  };
}
