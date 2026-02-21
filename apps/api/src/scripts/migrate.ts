import { execSync } from 'node:child_process';

execSync('pnpm prisma db push', { stdio: 'inherit' });
console.log('Prisma schema pushed');
