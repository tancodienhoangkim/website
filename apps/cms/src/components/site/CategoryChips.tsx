import Link from 'next/link';

export type CategoryChip = { label: string; href: string; active?: boolean };

export function CategoryChips({
  chips,
  ariaLabel,
}: {
  chips: CategoryChip[];
  ariaLabel?: string;
}) {
  if (!chips || chips.length === 0) return null;
  return (
    <nav aria-label={ariaLabel ?? 'Danh mục'} className="category-chips">
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          className={chip.active ? 'category-chip active' : 'category-chip'}
          aria-current={chip.active ? 'page' : undefined}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
