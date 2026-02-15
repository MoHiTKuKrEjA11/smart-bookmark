'use client'

import { supabase } from '@/lib/supabase'

export default function Home() {

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={login}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Login with Google
      </button>
    </div>
  )
}
