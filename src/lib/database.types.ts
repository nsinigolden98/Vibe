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
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_symbol?: string;
          avatar_gradient?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_symbol?: string;
          avatar_gradient?: string;
          created_at?: string;
        };
      };
      drops: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          image_url: string | null;
          mood: string | null;
          category: string;
          is_ghost: boolean;
          expires_at: string;
          seen_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          image_url?: string | null;
          mood?: string | null;
          category?: string;
          is_ghost?: boolean;
          expires_at?: string;
          seen_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          image_url?: string | null;
          mood?: string | null;
          category?: string;
          is_ghost?: boolean;
          expires_at?: string;
          seen_count?: number;
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
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          options?: Json;
          mood?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question?: string;
          options?: Json;
          mood?: string | null;
          expires_at?: string;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          description?: string | null;
          expires_at?: string;
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
    };
  };
}
