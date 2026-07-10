export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  // In production, you'd send an email via SendGrid/Resend etc.
  console.log('Contact form submission:', { name, email, subject, message })
  return NextResponse.json({ success: true })
}

