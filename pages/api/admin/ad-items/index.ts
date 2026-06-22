import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/nextauth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || !session.user.email) return res.status(401).json({ message: 'Unauthorized' })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || (user.role !== 'MARKET_MANAGER' && user.role !== 'AD_CHAMPION')) return res.status(403).json({ message: 'Forbidden' })

  if (req.method === 'GET') {
    const items = await prisma.adItem.findMany({ where: { removed: false }, orderBy: { createdAt: 'desc' } })
    return res.status(200).json({ items })
  }

  if (req.method === 'POST') {
    const { weekId, storeId, department, itemName, upc, featureLocation } = req.body
    const item = await prisma.adItem.create({ data: { weekId: Number(weekId), storeId: storeId ? Number(storeId) : null, department, itemName, upc, featureLocation } })
    return res.status(201).json({ item })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
