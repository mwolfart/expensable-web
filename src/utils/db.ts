import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()

// async function main(): Promise<void> {
//   await db.$connect()
//   // ... you will write your Prisma Client queries here
// }

// main()
//   .then(async () => {
//     await db.$disconnect()
//   })
//   .catch(async (e) => {
//     // eslint-disable-next-line no-console
//     console.error(e)
//     await db.$disconnect()
//     process.exit(1)
//   })