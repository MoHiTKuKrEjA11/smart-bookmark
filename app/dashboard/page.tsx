'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Bookmark = {
    id: string
    title: string
    url: string
}

export default function Dashboard() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

    useEffect(() => {
        fetchBookmarks()

        const channel = supabase
            .channel('realtime bookmarks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookmarks' },
                () => {
                    fetchBookmarks()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchBookmarks = async () => {
        const { data } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setBookmarks(data)
    }

    const addBookmark = async () => {
        const user = await supabase.auth.getUser()

        await supabase.from('bookmarks').insert([
            {
                title,
                url,
                user_id: user.data.user?.id
            }
        ])

        setTitle('')
        setUrl('')
    }

    const deleteBookmark = async (id: string) => {
        await supabase.from('bookmarks').delete().eq('id', id)
    }

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Bookmarks</h1>

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
                    className="bg-blue-500 text-white px-4"
                >
                    Add
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
