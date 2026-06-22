import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const week = Number(req.query.week) || undefined
  if(req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try{
    // Best executing stores
    const stores = await prisma.store.findMany()
    const storeScores = [] as any[]
    for(const s of stores){
      const subs = await prisma.submission.findMany({ where: { storeId: s.id, weekId: week }, select: { score: true } })
      const scores = subs.map(x=>x.score || 0)
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0
      storeScores.push({ store: s, avg, count: scores.length })
    }
    const best = storeScores.filter(s=>s.count>0).sort((a,b)=>b.avg-a.avg).slice(0,5)
    const needs = storeScores.filter(s=>s.count>0 && s.avg < 70)

    // Top missed items (itemOnFeature == 0)
    const missed = await prisma.$queryRawUnsafe(`
      SELECT "adItemId", COUNT(*) as cnt FROM "Submission" WHERE "weekId" = ${week} AND "itemOnFeature" = 0 GROUP BY "adItemId" ORDER BY cnt DESC LIMIT 10
    `)

    // Top signage issues (signage == 0)
    const signage = await prisma.$queryRawUnsafe(`
      SELECT "adItemId", COUNT(*) as cnt FROM "Submission" WHERE "weekId" = ${week} AND "signage" = 0 GROUP BY "adItemId" ORDER BY cnt DESC LIMIT 10
    `)

    // Suggested opportunities
    const suggestions = await prisma.suggestion.findMany({ where: { status: 'OPEN' }, take: 20 })

    const plan = `Top missed item IDs: ${missed.map((m:any)=>m.adItemId).join(', ')}`

    return res.status(200).json({ best, needs, missed, signage, suggestions, plan })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
