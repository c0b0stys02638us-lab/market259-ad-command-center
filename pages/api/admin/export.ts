import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { Parser } from 'json2csv'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  const week = Number(req.query.week || 21)
  try{
    const subs = await prisma.submission.findMany({ where: { weekId: week }, include: { AdItem: true, photos: true } })
    const rows = subs.map(s=>({
      id: s.id,
      storeId: s.storeId,
      weekId: s.weekId,
      itemName: s.AdItem?.itemName || '',
      upc: s.AdItem?.upc || '',
      score: s.score || 0,
      photoCount: s.photoCount || 0,
      notes: s.notes || ''
    }))
    const parser = new Parser()
    const csv = parser.parse(rows)
    res.setHeader('Content-disposition', `attachment; filename=week-${week}-submissions.csv`)
    res.setHeader('Content-Type', 'text/csv')
    res.status(200).send(csv)
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
