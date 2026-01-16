import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function getSessionToken() {
  try {
    const headersList = await headers()
    const cookieHeader = headersList.get('cookie')
    
    if (!cookieHeader) {
      return null
    }
    
    const sessionToken = cookieHeader
      .split(';')  
      .map(cookie => cookie.trim()) 
      .find(cookie => cookie.startsWith('better-auth.session_token='))  
      ?.split('=')[1]

    if (!sessionToken) {
      return null
    }

    return sessionToken
  } catch (error) {
    console.error('Error getting session token:', error)
    return null
  }
}
