import type { Payload } from 'payload';

const MIN_PASSWORD_LENGTH = 16;

export async function seedUsers(p: Payload): Promise<{ id: string | number }> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email) {
    throw new Error(
      'SEED_ADMIN_EMAIL env required for seed. Set it in .env.local (dev) or deploy secret (prod).',
    );
  }
  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD env required for seed. ' +
        'Generate a strong password: `openssl rand -base64 24` (or `pwgen 24 1`).',
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `SEED_ADMIN_PASSWORD too short (${password.length} chars). ` +
        `Minimum ${MIN_PASSWORD_LENGTH} chars required. ` +
        'Generate: `openssl rand -base64 24`.',
    );
  }

  const existing = await p.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.docs[0]) {
    p.logger.info(`user exists: ${email}`);
    return { id: existing.docs[0].id };
  }
  const doc = await p.create({
    collection: 'users',
    data: {
      email,
      password,
      name: 'Admin',
      role: 'admin',
    },
  });
  p.logger.info(`user created: ${email}`);
  return { id: doc.id };
}
