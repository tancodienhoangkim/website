import type { Payload } from 'payload';

export async function seedTeam(p: Payload) {
  const members = [
    { name: 'Nguyễn Văn A', role: 'Kiến trúc sư trưởng' },
    { name: 'Trần Thị B', role: 'Giám đốc thiết kế nội thất' },
    { name: 'Lê Văn C', role: 'Giám sát công trình' },
  ];
  const ids: string[] = [];
  for (let i = 0; i < members.length; i++) {
    const m = members[i]!;
    const existing = await p.find({
      collection: 'team-members',
      where: { name: { equals: m.name } },
      limit: 1,
    });
    if (existing.docs[0]) {
      ids.push(String(existing.docs[0].id));
      continue;
    }
    const doc = await p.create({ collection: 'team-members', data: { ...m, order: i } as any });
    ids.push(String(doc.id));
  }
  return ids;
}
