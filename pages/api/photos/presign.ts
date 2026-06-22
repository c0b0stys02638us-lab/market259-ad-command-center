import { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '../../../lib/prisma'

async function findUserFromReq(req: NextApiRequest){
  const cookie = req.headers.cookie || ''
  const tokenMatch = cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('session_token='))
  if(!tokenMatch) return null
  const token = tokenMatch.split('=')[1]
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  if(!session) return null
  return session.user
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const user = await findUserFromReq(req)
  if(!user) return res.status(401).json({ message: 'Unauthorized' })

  const { filename, contentType } = req.body
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.NEXT_PUBLIC_S3_BUCKET) {
    return res.status(500).json({ message: 'S3 not configured. Set AWS keys and NEXT_PUBLIC_S3_BUCKET in .env' })
  }

  if (!filename || !contentType) return res.status(400).json({ message: 'Missing filename or contentType' })

  try {
    const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
    const Key = `photos/${Date.now()}-${filename}`
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      Key,
      ContentType: contentType
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    return res.status(200).json({ url, key: Key, publicUrl: `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.amazonaws.com/${Key}` })
  } catch (err) {
    console.error('presign error', err)
    return res.status(500).json({ message: 'Error creating presigned url' })
  }
}
