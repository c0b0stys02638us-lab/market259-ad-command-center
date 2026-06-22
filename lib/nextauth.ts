import Auth0Provider from 'next-auth/providers/auth0'
import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER || ''
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Ensure user exists in our Users table and sync role if present in profile
      try{
        if(!user?.email) return false
        const existing = await prisma.user.findUnique({ where: { email: user.email } })
        if(!existing){
          await prisma.user.create({ data: { name: user.name || user.email, email: user.email, role: 'TEAM_LEAD' } })
        }
        return true
      }catch(e){
        console.error('signIn callback error', e)
        return false
      }
    },
    async jwt({ token, user, account, profile }){
      // token contains basic claims; ensure email is present
      if(user && user.email) token.email = user.email
      return token
    },
    async session({ session, token }){
      if(token && token.email){
        // attach role from prisma
        const u = await prisma.user.findUnique({ where: { email: String(token.email) } })
        if(u){
          (session as any).user.id = u.id
          (session as any).user.role = u.role
          (session as any).user.storeId = u.storeId
        }
      }
      return session
    }
  }
}
