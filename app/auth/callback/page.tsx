'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const handleSession = async () => {
            const { data } = await supabase.auth.getSession()

            if (data.session) {
                router.push('/dashboard')
            } else {
                router.push('/')
            }
        }

        handleSession()
    }, [router])

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Signing you in...</p>
        </div>
    )
}
