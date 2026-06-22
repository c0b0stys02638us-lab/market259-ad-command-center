import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try{
    const cookie = req.headers.cookie || ''
    const tokenMatch = cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('session_token='))
    if(!tokenMatch) return res.status(200).json({ user: null })
    const token = tokenMatch.split('=')[1]
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
    if(!session) return res.status(200).json({ user: null })
    return res.status(200).json({ user: { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role } })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
