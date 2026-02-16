# Smart Bookmark App

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Save, organize, and access your bookmarks from anywhere with real-time synchronization across multiple tabs.

## 🚀 Features

- **Google OAuth Authentication** - Secure login using Google only
- **Add Bookmarks** - Save bookmarks with title and URL
- **Private Data** - Each user can only see their own bookmarks
- **Delete Bookmarks** - Remove bookmarks you no longer need
- **Real-time Updates** - See changes instantly without page reload
- **Multi-tab Sync** - Open multiple tabs and data syncs automatically

## 🛠️ Tech Stack

- **Next.js** (App Router) - Frontend & routing
- **Supabase** - Authentication, Database & Realtime
- **Tailwind CSS** - Styling
- **Vercel** - Deployment

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials configured in Supabase

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd smart-bookmark
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Setup

### Table Structure

**Table name:** `bookmarks`

**Columns:**
- `id` (uuid) - Primary key
- `title` (text) - Bookmark title
- `url` (text) - Bookmark URL
- `user_id` (uuid) - Foreign key to auth.users
- `created_at` (timestamp) - Creation timestamp

### Row Level Security (RLS)

RLS is enabled on the `bookmarks` table. Users can only access their own bookmarks based on `user_id`.

### Enable Realtime

1. Go to Supabase Dashboard → Database → Replication
2. Add the `bookmarks` table to the publication
3. This enables real-time updates across multiple tabs

## 🔐 Authentication

- Google OAuth login using Supabase Auth
- No email/password login option
- Each user has private data using Row Level Security

## 🔄 Real-time Feature

The app supports real-time synchronization across multiple browser tabs:

### How it works:

1. **Realtime Subscription** - Uses Supabase channels to listen for database changes
2. **Tab Focus Detection** - Automatically refetches bookmarks when tab becomes active
3. **Optimistic UI Updates** - UI updates instantly after adding a bookmark

### Testing Real-time Sync:

1. Open the app in two browser tabs
2. Add a bookmark in tab 1
3. Tab 2 should update automatically without refresh

## 🚢 Deployment

The app is deployed on Vercel: https://smart-bookmark-ochre.vercel.app/.

### Environment Variables for Production:

Set these in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 Challenges & Solutions

### Biggest Problem: Tab Synchronization

**Problem:**
- New bookmarks only visible after page refresh
- Realtime not working on localhost
- Multiple tabs not syncing data

**Solution:**
1. Enabled Realtime in Supabase Dashboard
2. Implemented correct Realtime subscription using Supabase channels
3. Added tab focus detection to refetch data when switching tabs
4. Implemented optimistic UI updates for instant feedback

### Other Challenges:

- **Google OAuth redirect_uri_mismatch error** - Fixed by configuring correct redirect URLs in Supabase
- **Realtime not working on localhost** - Resolved by enabling replication in Supabase dashboard

