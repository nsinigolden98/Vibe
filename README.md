# VIBE - Anonymous-First Social Platform

VIBE is a mood-driven, anonymous-first social platform where users share "Drops", participate in "Pulse" polls, and chat in real-time "Spaces".

## Features

### Core Platform
- **Anonymous-first** - Ghost mode for complete anonymity
- **Mood-driven** - Express your current mood with every post
- **Interaction-focused** - FEEL, ECHO, FLOW, and VIBE WITH others

### Platform Language
- Post = **DROP**
- Comment = **ECHO**
- Like = **FEEL**
- Share = **FLOW**
- Follow = **VIBE WITH**
- Followers = **VIBERS**
- Feed = **STREAM**
- Profile = **AURA**
- Trending = **WAVE**
- Rooms = **SPACES**
- Polls = **PULSE**

### Features
- **STREAM** - Algorithm-based feed (not just chronological)
- **PULSE** - Create and vote on polls
- **SPACES** - Real-time chat rooms with typing indicators
- **AURA** - Profile with XP, levels, streaks, and badges
- **Premium** - $4/month for exclusive features

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Payments**: Paystack
- **UI Components**: shadcn/ui + Radix UI

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://ysntgpckxdryktrkfftr.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_92b2220873fcc64d51d3d60771e6ea9d65152b3d
```

### 2. Supabase Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the contents of `supabase_schema.sql`
4. Enable Google OAuth in Authentication > Providers
5. Configure storage bucket "vibe-uploads" for public access

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Database Schema

### Tables

1. **users** - User profiles extending auth.users
2. **drops** - Posts/content
3. **echoes** - Comments
4. **post_engagement** - Engagement counters
5. **user_interactions** - Like/view/share tracking
6. **pulse_options** - Poll options
7. **pulse_votes** - Poll votes
8. **spaces** - Chat rooms
9. **space_messages** - Chat messages
10. **vibe_relationships** - Follow relationships
11. **subscriptions** - Premium subscriptions
12. **badges** - Achievement badges
13. **user_badges** - User earned badges
14. **notifications** - User notifications

## Premium Features ($4/month)

- Custom AURA themes & colors
- Multiple personas
- Private Spaces
- Analytics dashboard
- Edit Drops anytime
- Pin Drops to profile
- Premium badge
- Disable sound effects

## Gamification

- **XP System** - Earn XP for posting, liking, commenting, voting
- **Levels** - Level up based on XP (level = xp / 100 + 1)
- **Streaks** - Daily posting streaks
- **Badges** - Earn badges for achievements

## API Functions

### Feed Algorithm
The feed uses an algorithm that considers:
- Vibing relationships (posts from people you vibe with rank higher)
- Engagement score (feels, echoes, shares)
- Recency (newer posts rank higher)
- User preferences

### Real-time Features
- Space messages (Supabase Realtime)
- Typing indicators (Broadcast channel)
- Live engagement updates

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Public read access for most content
- Authentication required for writes

## License

MIT
