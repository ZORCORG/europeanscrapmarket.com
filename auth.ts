// Temporary config for Better Auth CLI schema generation
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: { type: 'sqlite' },
  secret: 'temp-secret-for-cli',
  baseURL: 'https://europeanscrapmarket.com/api/auth',
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  magicLink: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'buyer', input: false },
      company: { type: 'string', required: false, input: true },
      phone: { type: 'string', required: false, input: true },
      country: { type: 'string', required: false, input: true },
      status: { type: 'string', required: false, defaultValue: 'active', input: false },
    },
  },
});
