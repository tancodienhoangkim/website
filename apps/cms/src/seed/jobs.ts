import type { Payload } from 'payload';

export async function seedJobs(p: Payload) {
  const jobs = [
    { title: 'Kiến trúc sư', department: 'Design' },
    { title: 'Giám sát công trình', department: 'Construction' },
  ];
  for (const j of jobs) {
    const existing = await p.find({
      collection: 'jobs',
      where: { title: { equals: j.title } },
      limit: 1,
    });
    if (existing.docs[0]) continue;
    await p.create({
      collection: 'jobs',
      data: { ...j, summary: `Vị trí ${j.title}`, status: 'open' } as any,
    });
  }
}
