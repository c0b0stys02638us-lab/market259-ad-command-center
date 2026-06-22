import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { computeScore } from '../../lib/scoring'

async function findUserFromReq(req: NextApiRequest){
  const cookie = req.headers.cookie || ''
  const tokenMatch = cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('session_token='))
  if(!tokenMatch) return null
  const token = tokenMatch.split('=')[1]
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  if(!session) return null
  return session.user
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try{
    const user = await findUserFromReq(req)
    if(!user) return res.status(401).json({ message: 'Unauthorized' })

    const body = req.body
    const storeNumber = Number(body.storeNumber || user.storeId || 259)
    const store = await prisma.store.findUnique({ where: { storeNumber } })
    let storeId = store?.id
    if(!storeId){
      const s = await prisma.store.create({ data: { storeNumber, name: `Store ${storeNumber}`, market: 259 } })
      storeId = s.id
    }

    const photoCount = body.photoCount ? Number(body.photoCount) : 0
    const score = computeScore({
      itemOnFeature: body.itemOnFeature,
      fullness: body.fullness,
      signage: body.signage,
      priceShown: body.priceShown,
      rollbackFlag: body.rollbackFlag,
      modularHome: body.modularHome,
      photoCount
    })

    let adItemId = 0
    if(body.upc){
      const found = await prisma.adItem.findFirst({ where: { upc: body.upc } })
      if(found) adItemId = found.id
    }

    // Create submission
    const submission = await prisma.submission.create({ data: {
      adItemId: adItemId,
      storeId,
      weekId: Number(body.weekNumber || 21),
      submitter: body.submitter || user.name || 'unknown',
      itemOnFeature: mapToInt(body.itemOnFeature),
      fullness: mapFullnessToInt(body.fullness),
      signage: mapToInt(body.signage),
      priceShown: mapPriceToInt(body.priceShown),
      rollbackFlag: mapToInt(body.rollbackFlag),
      modularHome: mapToInt(body.modularHome),
      photoCount: photoCount,
      score: score,
      notes: body.notes || ''
    }})

    // Create photo records if URLs provided
    if(Array.isArray(body.photoURLs) && body.photoURLs.length > 0){
      const photosData = body.photoURLs.map((u:string)=>({ submissionId: submission.id, url: u, uploadedBy: user.email }))
      await prisma.photo.createMany({ data: photosData })
    }

    return res.status(200).json({ message: 'Submission received', submission })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

function mapToInt(v:any){
  if(v === undefined || v === null) return 0
  const s = String(v).toLowerCase()
  if(s === 'yes') return 1
  if(s === 'no') return 0
  if(s === 'partial') return 2
  if(s === 'na' || s === 'n/a') return -1
  return 0
}
function mapFullnessToInt(v:any){
  if(v === undefined || v === null) return 0
  const s = String(v).toLowerCase()
  if(s === 'full') return 2
  if(s === 'partial') return 1
  if(s === 'no') return 0
  if(s === 'na' || s === 'n/a') return -1
  return 0
}
function mapPriceToInt(v:any){
  if(v === undefined || v === null) return 0
  const s = String(v).toLowerCase()
  if(s === 'yes') return 2
  if(s === 'no') return 0
  if(s === 'na' || s === 'n/a') return -1
  return 0
}
