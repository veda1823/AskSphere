const { PrismaClient } = require('@prisma/client');

// PrismaClient is attached to the global scope in development to prevent
// exhausting your database connection limit during nodemon reloads.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
