import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const jane = await prisma.user.upsert({
    where: { email: 'jane@prisma.io' },
    update: {},
    create: {
      email: 'jane@prisma.io',
      name: 'Jane',
      posts: {
        create: [
          {
            title:
              'Comparing Database Types: How Database Types Evolved to Meet Different Needs',
            content:
              'https://www.prisma.io/blog/comparison-of-database-models-1iz9u29nwn37/',
            published: true,
          },
          {
            title: 'Analysing Sleep Patterns: The Quantified Self',
            content: 'https://quantifiedself.com/get-started/',
            published: true,
          },
        ]
      }
    }
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
      posts: {
        create: [
          {
            title:
              'Deploying Prisma ORM to Traditional servers',
            content:
              'https://www.prisma.io/docs/orm/prisma-client/deployment/traditional',
            published: true,
          },
        ]
      }
    }
  })

  console.log({ jane, bob })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })