import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { categoryImage, categoryStyle } from '@/lib/categories';
import type { Draw } from '@/types';

/**
 * Reveal estilo "cards stack": las tarjetas aparecen apiladas y se van
 * desplegando una a una con un pequeño rebote.
 */
export function RevealAnimation({ draw }: { draw: Draw }) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setRevealedCount(0);
    if (draw.selections.length === 0) return;
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= draw.selections.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 650);
    return () => clearInterval(interval);
  }, [draw.id, draw.selections.length]);

  if (draw.selections.length === 0) {
    return <p className="text-sm text-muted-foreground">No hubo planes para este sorteo.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AnimatePresence>
        {draw.selections.slice(0, revealedCount).map((s, i) => {
          const { icon: Icon, tint } = categoryStyle(s.plan.category);
          const img = s.plan.image_url || categoryImage(s.plan.category);
          return (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 40, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className="relative overflow-hidden rounded-2xl border bg-card shadow-md"
            >
              {img ? (
                <div className="relative h-36 w-full overflow-hidden">
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${tint}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.plan.category || 'plan'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between px-5 pt-5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tint}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.plan.category || 'plan'}
                  </span>
                  <Star className="h-4 w-4 text-secondary" />
                </div>
              )}

              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Plan #{i + 1}
                </p>
                <h4 className="font-serif-display mt-1 text-2xl font-bold leading-tight">
                  {s.plan.title}
                </h4>
                {s.plan.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {s.plan.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={s.plan.author.name} src={s.plan.author.avatar_url} size={22} />
                    Propuesto por <b className="text-foreground">{s.plan.author.name}</b>
                  </span>
                  {s.for_user && (
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> para {s.for_user.name}
                    </span>
                  )}
                </div>
              </div>

              <Sparkles className="absolute right-3 top-3 h-5 w-5 text-secondary/70 mix-blend-multiply" />
            </motion.article>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
