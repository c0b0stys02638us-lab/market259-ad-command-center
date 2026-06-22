import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  try{
    const body = req.body
    // Basic mapping - in a real app validate fields and map enums
    const storeNumber = Number(body.storeNumber || 259)
    const store = await prisma.store.findUnique({ where: { storeNumber } })
    let storeId = store?.id
    if(!storeId){
      const s = await prisma.store.create({ data: { storeNumber, name: `Store ${storeNumber}`, market: 259 } })
      storeId = s.id
    }

    // Find ad item if exists by upc & week
    let adItem = null
    if(body.upc){
      adItem = await prisma.adItem.findFirst({ where: { upc: body.upc, weekId: undefined } })
    }

    // Create a minimal submission record
    const submission = await prisma.submission.create({ data: {
      adItemId: adItem?.id ?? 0,
      storeId,
      weekId: Number(body.weekNumber || 21),
      submitter: body.submitter || 'unknown',
      itemOnFeature: mapBool(body.itemOnFeature),
      fullness: mapFullness(body.fullness),
      signage: mapBool(body.signage),
      priceShown: mapPrice(body.priceShown),
      rollbackFlag: mapBool(body.rollbackFlag),
      modularHome: mapBool(body.modularHome),
      notes: body.notes || ''
    }}).catch(e => {
      console.error('submission create error', e)
      return null
    })

    return res.status(200).json({ message: 'Submission received', submission })
  }catch(err){
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

function mapBool(v:any){
  if(!v) return 0
  if(v === 'yes') return 1
  if(v === 'no') return 0
  if(v === 'partial') return 2
  if(v === 'na') return -1
  return 0
}
function mapFullness(v:any){
  if(!v) return 0
  if(v === 'full') return 2
  if(v === 'partial') return 1
  if(v === 'no') return 0
  return 0
}
function mapPrice(v:any){
  if(!v) return 0
  if(v === 'yes') return 2
  if(v === 'no') return 0
  if(v === 'na') return -1
  return 0
}
