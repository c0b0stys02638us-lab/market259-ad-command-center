import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { email, name, role, storeNumber } = req.body
  if(!email || !name) return res.status(400).json({ message: 'Missing email or name' })

  try{
    let user = await prisma.user.findUnique({ where: { email } })
    if(!user){
      user = await prisma.user.create({ data: { name, email, role: role || 'TEAM_LEAD' } })
    }

    const token = uuidv4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    await prisma.session.create({ data: { token, userId: user.id, expiresAt: expires } })

    // Set HttpOnly cookie
    res.setHeader('Set-Cookie', `session_token=${token}; Path=/; HttpOnly; SameSite=Lax`)
    return res.status(200).json({ message: 'Logged in', user })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
