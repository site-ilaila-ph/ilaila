import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown'
    return NextResponse.json({ success: false, type: 'generic', message }, { status: 400 })
  }
}
