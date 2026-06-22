import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try{
    const cookie = req.headers.cookie || ''
    const tokenMatch = cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('session_token='))
    if(!tokenMatch) return res.status(200).json({ message: 'No session' })
    const token = tokenMatch.split('=')[1]
    await prisma.session.deleteMany({ where: { token } })
    // Clear cookie
    res.setHeader('Set-Cookie', `session_token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`)
    return res.status(200).json({ message: 'Logged out' })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
