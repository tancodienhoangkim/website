import type { Access, AccessResult } from 'payload';

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin';
export const isAuth: Access = ({ req }) => Boolean(req.user);
export const isPublic = (_args?: Parameters<Access>[0]): AccessResult => true;

// Read: published-only for anon, all for auth
export const isPublishedOrAuth: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } };
