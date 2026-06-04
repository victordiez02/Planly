import { cn } from '@/lib/utils';

const COLORS = [
  'bg-primary/15 text-primary',
  'bg-secondary/20 text-secondary',
  'bg-accent/20 text-accent',
  'bg-foreground/10 text-foreground',
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({
  src,
  name,
  className,
  size = 36,
}: {
  src?: string | null;
  name: string;
  className?: string;
  size?: number;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={cn('rounded-full object-cover ring-2 ring-background', className)}
      />
    );
  }
  return (
    <span
      style={style}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-display font-semibold ring-2 ring-background',
        colorFor(name),
        className,
      )}
    >
      {initials(name) || '·'}
    </span>
  );
}

export function AvatarStack({
  users,
  max = 4,
  size = 32,
}: {
  users: { id: string; name: string; avatar_url?: string | null }[];
  max?: number;
  size?: number;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => (
        <Avatar key={u.id} name={u.name} src={u.avatar_url} size={size} />
      ))}
      {extra > 0 && (
        <span
          style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
          className="inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
