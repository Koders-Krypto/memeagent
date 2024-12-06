import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json()

        // Verify the ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken)

        // Get user details
        const { uid, email } = decodedToken

        // Return user info
        return NextResponse.json({
            success: true,
            data: {
                userId: uid,
                email,
            }
        })
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { success: false, error: 'Authentication failed' },
            { status: 401 }
        )
    }
} 