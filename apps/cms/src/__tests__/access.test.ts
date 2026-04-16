import { describe, it, expect } from 'vitest';
import { isAdmin, isAuth, isPublic } from '../access/isAdmin';

const mkReq = (role?: 'admin' | 'editor') => ({ req: { user: role ? { id: 'u1', role } : undefined } } as any);

describe('access helpers', () => {
  it('isAdmin true only for admin', () => {
    expect(isAdmin(mkReq('admin'))).toBe(true);
    expect(isAdmin(mkReq('editor'))).toBe(false);
    expect(isAdmin(mkReq())).toBe(false);
  });
  it('isAuth true when logged in', () => {
    expect(isAuth(mkReq('admin'))).toBe(true);
    expect(isAuth(mkReq('editor'))).toBe(true);
    expect(isAuth(mkReq())).toBe(false);
  });
  it('isPublic always true', () => {
    expect(isPublic()).toBe(true);
  });
});
