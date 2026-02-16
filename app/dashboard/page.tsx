'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Bookmark = {
    id: string
    title: string
    url: string
}

export default function Dashboard() {
    const router = useRouter()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser()

            if (!data.user) {
                router.push('/login')
                return
            }

            setUserId(data.user.id)
            fetchBookmarks(data.user.id)

            const channel = supabase
                .channel('bookmarks-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookmarks',
                        filter: `user_id=eq.${data.user.id}`,
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                        }

                        if (payload.eventType === 'DELETE') {
                            setBookmarks((prev) =>
                                prev.filter((b) => b.id !== payload.old.id)
                            )
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        init()
    }, [router])

    const fetchBookmarks = async (uid: string) => {
        const { data } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })

        if (data) setBookmarks(data)
    }

    const addBookmark = async () => {
        if (!title || !url || !userId) return

        setLoading(true)

        const { data, error } = await supabase
            .from('bookmarks')
            .insert([{ title, url, user_id: userId }])
            .select()
            .single()

        setLoading(false)

        if (!error && data) {
            setBookmarks((prev) => [data, ...prev])
            setTitle('')
            setUrl('')
        }
    }

    const deleteBookmark = async (id: string) => {
        await supabase.from('bookmarks').delete().eq('id', id)
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }

    const logout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="p-8 max-w-xl mx-auto">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Bookmarks</h1>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                >
                    Logout
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 flex-1"
                />
                <input
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border p-2 flex-1"
                />
                <button
                    onClick={addBookmark}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4"
                >
                    {loading ? 'Adding...' : 'Add'}
                </button>
            </div>

            {bookmarks.map((b) => (
                <div
                    key={b.id}
                    className="flex justify-between items-center border p-2 mb-2"
                >
                    <a href={b.url} target="_blank" className="text-blue-600">
                        {b.title}
                    </a>
                    <button
                        onClick={() => deleteBookmark(b.id)}
                        className="text-red-500"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )
}
