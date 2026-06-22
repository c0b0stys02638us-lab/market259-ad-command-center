export async function getUserFromSession(req: any, res: any) {
  const { getServerSession } = await import('next-auth/next')
  const { authOptions } = await import('../lib/nextauth')
  const prisma = (await import('../lib/prisma')).prisma
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user || !session.user.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user
}

export function requireRole(user: any, roles: string[]) {
  if (!user) return false
  return roles.includes(user.role)
}
