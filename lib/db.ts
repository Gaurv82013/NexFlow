import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set')
    }

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    prisma = new PrismaClient({
        adapter,
        errorFormat: 'pretty',
    })
} else {
    if (!globalForPrisma.prisma) {
        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set')
        }

        const pool = new Pool({ connectionString })
        const adapter = new PrismaPg(pool)

        globalForPrisma.prisma = new PrismaClient({
            adapter,
            errorFormat: 'pretty',
        })
    }
    prisma = globalForPrisma.prisma
}

export default prisma