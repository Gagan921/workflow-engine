/**
 * Database Package
 *
 * Exports the Prisma client for database access.
 * Uses singleton pattern to ensure single connection pool.
 */
import { PrismaClient } from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export * from '@prisma/client';
