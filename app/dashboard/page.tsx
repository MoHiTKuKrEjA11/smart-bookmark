"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Bookmark = {
    id: string;
    title: string;
    url: string;
};

export default function Dashboard() {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchBookmarks = async (uid: string) => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false });

        if (data) setBookmarks(data);
    };

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                router.push("/login");
                return;
            }

            setUserId(data.user.id);
            fetchBookmarks(data.user.id);

            const channel = supabase
                .channel("bookmarks-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "bookmarks",
                        filter: `user_id=eq.${data.user.id}`,
                    },
                    (payload) => {
                        if (payload.eventType === "INSERT") {
                            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
                        }

                        if (payload.eventType === "DELETE") {
                            setBookmarks((prev) =>
                                prev.filter((b) => b.id !== payload.old.id),
                            );
                        }
                    },
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        init();
    }, [router]);

    const addBookmark = async () => {
        if (!title || !url || !userId) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("bookmarks")
            .insert([{ title, url, user_id: userId }])
            .select()
            .single();

        setLoading(false);

        if (!error && data) {
            setBookmarks((prev) => [data, ...prev]);
            setTitle("");
            setUrl("");
        }
    };

    const deleteBookmark = async (id: string) => {
        await supabase.from("bookmarks").delete().eq("id", id);
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 px-6 py-10 transition-colors">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-white"
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Bookmarks
                        </h1>
                    </div>

                    <button
                        onClick={logout}
                        className="text-sm bg-black dark:bg-neutral-800 text-white px-4 py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-neutral-700 transition"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md dark:shadow-lg p-6 space-y-4 border border-gray-200 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Add New Bookmark
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            placeholder="Bookmark Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        />

                        <input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                        />

                        <button
                            onClick={addBookmark}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600 text-white px-6 py-2 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? "Adding..." : "Add"}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {bookmarks.length === 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md dark:shadow-lg p-10 text-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-neutral-800">
                            No bookmarks yet.
                            <br />
                            Add your first bookmark above.
                        </div>
                    )}

                    {bookmarks.map((b) => (
                        <div
                            key={b.id}
                            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm dark:shadow-md p-4 flex justify-between items-center hover:shadow-md dark:hover:shadow-lg transition border border-gray-200 dark:border-neutral-800"
                        >
                            <div>
                                <a
                                    href={b.url}
                                    target="_blank"
                                    className="text-gray-900 dark:text-white font-medium hover:text-orange-500 dark:hover:text-orange-400 transition"
                                >
                                    {b.title}
                                </a>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                    {b.url}
                                </p>
                            </div>

                            <button
                                onClick={() => deleteBookmark(b.id)}
                                className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}