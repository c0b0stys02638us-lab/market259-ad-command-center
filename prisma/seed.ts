// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  // create store 259
  await prisma.store.upsert({
    where: { storeNumber: 259 },
    update: {},
    create: {
      storeNumber: 259,
      name: 'Walmart Store 259',
      market: 259
    }
  })

  // seed week 21 and next 9 weeks
  const startWeek = 21
  const now = new Date()
  for(let i=0;i<10;i++){
    const weekNumber = startWeek + i
    const start = new Date()
    start.setDate(now.getDate() + i*7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    await prisma.week.upsert({
      where: { weekNumber },
      update: {},
      create: {
        weekNumber,
        startDate: start,
        endDate: end,
        theme: i===0? 'Current Week': null
      }
    })
  }

  console.log('Seed complete')
}

main().catch(e => console.error(e)).finally(()=>prisma.$disconnect())
