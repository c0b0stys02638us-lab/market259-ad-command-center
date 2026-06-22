import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/nextauth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || !session.user.email) return res.status(401).json({ message: 'Unauthorized' })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || (user.role !== 'MARKET_MANAGER' && user.role !== 'AD_CHAMPION')) return res.status(403).json({ message: 'Forbidden' })

  const id = Number(req.query.id)
  if (req.method === 'GET') {
    const item = await prisma.adItem.findUnique({ where: { id } })
    return res.status(200).json({ item })
  }

  if (req.method === 'PUT') {
    const { department, itemName, upc, featureLocation, removed } = req.body
    const updated = await prisma.adItem.update({ where: { id }, data: { department, itemName, upc, featureLocation, removed: removed ?? false } })
    return res.status(200).json({ item: updated })
  }

  if (req.method === 'DELETE') {
    // soft delete
    const updated = await prisma.adItem.update({ where: { id }, data: { removed: true } })
    return res.status(200).json({ item: updated })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
