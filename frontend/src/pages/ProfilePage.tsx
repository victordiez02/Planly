import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { categoryStyle, categoryImage } from '@/lib/categories';
import { useUserProfile } from '@/features/groups/queries';

export function ProfilePage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useUserProfile(id);

  if (isLoading || !data) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-card" />;
  }

  const { user, shared_groups, plans, stats } = data;

  return (
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="filmstrip-x from-primary/12 relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br via-card/90 to-accent/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14"
      >
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <Avatar name={user.name} src={user.avatar_url} size={96} />
          <div className="flex-1">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Perfil</p>
            <h1 className="font-serif-display text-4xl font-bold md:text-5xl">{user.name}</h1>
            <p className="mt-1 text-muted-foreground">{user.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              icon={<Sparkles className="h-4 w-4" />}
              label="Planes creados"
              value={stats.plans_created}
            />
            <Stat
              icon={<Trophy className="h-4 w-4" />}
              label="Sorteados"
              value={stats.times_selected}
            />
          </div>
        </div>
      </motion.header>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
          <Users className="h-5 w-5 text-muted-foreground" /> Grupos en común
        </h2>
        {shared_groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no compartís ningún grupo.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shared_groups.map((g) => (
              <Link
                key={g.id}
                to={`/g/${g.id}`}
                className="rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-serif-display text-lg font-semibold">{g.name}</p>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold">Planes propuestos</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no ha propuesto planes en grupos que compartís.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const { icon: Icon, tint } = categoryStyle(p.category);
              const img = p.image_url || categoryImage(p.category);
              return (
                <article key={p.id} className="polaroid">
                  {img ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-sm">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-sm bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" />
                  )}
                  <div className="space-y-2 pt-3">
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs ${tint}`}
                    >
                      <Icon className="h-3 w-3" /> {p.category || 'plan'}
                    </span>
                    <p className="font-serif-display text-base font-semibold leading-tight">
                      {p.title}
                    </p>
                    {p.completed_at && <Badge variant="accent">hecho</Badge>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-background/60 px-5 py-3 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="font-display text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
