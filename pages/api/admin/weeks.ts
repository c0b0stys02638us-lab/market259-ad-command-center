import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/nextauth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || !session.user.email) return res.status(401).json({ message: 'Unauthorized' })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || (user.role !== 'MARKET_MANAGER' && user.role !== 'AD_CHAMPION')) return res.status(403).json({ message: 'Forbidden' })

  if (req.method === 'GET') {
    const weeks = await prisma.week.findMany({ orderBy: { weekNumber: 'asc' } })
    return res.status(200).json({ weeks })
  }

  if (req.method === 'POST') {
    const { weekNumber, startDate, endDate, theme } = req.body
    const w = await prisma.week.create({ data: { weekNumber: Number(weekNumber), startDate: new Date(startDate), endDate: new Date(endDate), theme } })
    return res.status(201).json({ week: w })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
