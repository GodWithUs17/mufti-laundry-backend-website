// import { defineConfig } from '@prisma/config';

// export default defineConfig({
//   datasource: {
//     url: process.env.DATABASE_URL,
//   },
// });


import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// This line is the "key" — it loads your .env variables into process.env
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});