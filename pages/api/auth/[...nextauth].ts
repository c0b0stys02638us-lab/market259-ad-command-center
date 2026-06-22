import NextAuth from 'next-auth'
import Auth0Provider from 'next-auth/providers/auth0'
import { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../../../lib/nextauth'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, authOptions)
}
