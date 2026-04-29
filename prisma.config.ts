// import { defineConfig } from '@prisma/config';

// export default defineConfig({
//   datasource: {
//     url: process.env.DATABASE_URL,
//   },
// });


import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// This line loads your .env variables into process.env
dotenv.config();

export default defineConfig({
  migrations: {
    seed: 'node prisma/seed.js',
  },
  datasource: {
    // Use the direct database connection for Prisma CLI commands
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});