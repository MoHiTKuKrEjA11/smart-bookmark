"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://smart-bookmark-ochre.vercel.app/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl dark:shadow-2xl p-10 text-center space-y-6 border border-gray-200 dark:border-neutral-800">
        <div className="flex justify-center">
          <div className="bg-orange-500 p-4 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Smart Bookmarks
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm">
            Save, organize, and access your bookmarks from anywhere. Private and
            synced in real-time.
          </p>
        </div>

       <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-black dark:bg-neutral-800 text-white py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-neutral-700 transition duration-200 shadow-md dark:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12
              s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.2 6.5 29.4 4 24 4
              12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20
              0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 18.9 12 24 12
              c3 0 5.7 1.1 7.8 3l5.7-5.7C34.2 6.5 29.4 4 24 4
              16.3 4 9.7 8.4 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.3 0 10.1-2 13.6-5.4l-6.3-5.2
              C29.3 35.5 26.8 36 24 36
              c-5.4 0-9.9-3.3-11.5-8l-6.6 5.1C9.6 39.5 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3
              c-1.1 3-3.3 5.4-6.3 6.9l6.3 5.2C39.8 36.3 44 30.7 44 24
              c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}