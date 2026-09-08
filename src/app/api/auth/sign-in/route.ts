import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { email, password } = body

    if (typeof email !== 'string' || email.trim() === '') {
        return NextResponse.json(
            {
                type: 'error',
                code: 'EMAIL_REQUIRED',
                message: 'Email is required.',
            },
            { status: 400 }
        )
    }

    if (typeof password !== 'string' || password === '') {
        return NextResponse.json(
            {
                type: 'error',
                code: 'PASSWORD_REQUIRED',
                message: 'Password is required.',
            },
            { status: 400 }
        )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
            emailRedirectTo: `${request.nextUrl.origin}/protected`,
        },
    })

    if (error) {
        return NextResponse.json(
            {
                type: 'error',
                code: `KNOWN_SUPABASE_AUTH_ERROR:${error.code}`,
                message: error.message,
            },
            { status: 400 }
        )
    }

    return NextResponse.json({
        type: 'success',
    })
}